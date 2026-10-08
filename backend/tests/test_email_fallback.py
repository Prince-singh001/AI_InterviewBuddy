import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
import httpx

from app.config import settings
from app.services.auth_service import (
    send_email,
    send_signup_otp,
    send_password_reset_email,
)


@pytest.mark.asyncio
async def test_1_resend_success_verified_domain():
    """TEST 1: OTP email sent successfully via Resend with verified sender domain."""
    with patch.object(settings, "RESEND_API_KEY", "re_test_key_123"), \
         patch.object(settings, "RESEND_FROM_EMAIL", "Interviewer Buddy AI <noreply@verified-domain.com>"), \
         patch("httpx.AsyncClient.post") as mock_post:
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response

        # Should succeed without calling fallbacks
        await send_email(
            to_email="recipient@otherdomain.com",
            subject="Test Subject",
            html_body="<p>Test</p>",
        )

        assert mock_post.called
        call_kwargs = mock_post.call_args.kwargs
        assert call_kwargs["json"]["from"] == "Interviewer Buddy AI <noreply@verified-domain.com>"
        assert call_kwargs["json"]["to"] == ["recipient@otherdomain.com"]
        assert call_kwargs["headers"]["Authorization"] == "Bearer re_test_key_123"


@pytest.mark.asyncio
async def test_2_resend_fails_falls_back_to_gmail_api():
    """TEST 2: Resend returns 403 unverified sender -> falls back to Gmail API."""
    with patch.object(settings, "RESEND_API_KEY", "re_test_key_123"), \
         patch.object(settings, "RESEND_FROM_EMAIL", "onboarding@resend.dev"), \
         patch.object(settings, "GMAIL_CLIENT_ID", "client_id_test"), \
         patch.object(settings, "GMAIL_CLIENT_SECRET", "client_sec_test"), \
         patch.object(settings, "GMAIL_REFRESH_TOKEN", "refresh_tok_test"), \
         patch.object(settings, "GMAIL_FROM_EMAIL", "test@gmail.com"), \
         patch("httpx.AsyncClient.post") as mock_resend_post, \
         patch("app.services.auth_service.send_email_using_gmail_api", new_callable=AsyncMock) as mock_gmail_api:

        mock_resend_response = MagicMock()
        mock_resend_response.status_code = 403
        mock_resend_response.text = '{"message": "You can only send testing emails to your own email address"}'
        mock_resend_post.return_value = mock_resend_response

        mock_gmail_api.return_value = True

        await send_email(
            to_email="user@example.com",
            subject="Test Subject",
            html_body="<p>Test</p>",
        )

        assert mock_resend_post.called
        assert mock_gmail_api.called


@pytest.mark.asyncio
async def test_3_gmail_api_invalid_grant_falls_back_to_smtp(capsys):
    """TEST 3: Gmail API has invalid_grant -> logs clear diagnostic message -> falls back to SMTP."""
    with patch.object(settings, "RESEND_API_KEY", None), \
         patch.object(settings, "GMAIL_CLIENT_ID", "client_id_test"), \
         patch.object(settings, "GMAIL_CLIENT_SECRET", "client_sec_test"), \
         patch.object(settings, "GMAIL_REFRESH_TOKEN", "bad_refresh_token"), \
         patch.object(settings, "GMAIL_FROM_EMAIL", "test@gmail.com"), \
         patch.object(settings, "SMTP_USERNAME", "smtp_user"), \
         patch.object(settings, "SMTP_PASSWORD", "smtp_pass"), \
         patch("app.services.auth_service.build") as mock_build, \
         patch("smtplib.SMTP") as mock_smtp:

        # Mock build execute raising invalid_grant RefreshError
        mock_service = MagicMock()
        mock_build.return_value = mock_service
        mock_service.users().messages().send().execute.side_effect = Exception("invalid_grant: Token has been expired or revoked.")

        # Mock SMTP succeeding
        mock_smtp_instance = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_smtp_instance

        await send_email(
            to_email="user@example.com",
            subject="Test Subject",
            html_body="<p>Test</p>",
        )

        captured = capsys.readouterr()
        assert "Gmail API refresh token is expired/revoked" in captured.out
        assert "Generate a new Gmail OAuth refresh token and update the deployment environment variable." in captured.out
        assert mock_smtp.called


@pytest.mark.asyncio
async def test_4_all_providers_fail_clean_500():
    """TEST 4: All providers fail (e.g. SMTP Network unreachable) -> Clean 500 HTTPException."""
    with patch.object(settings, "RESEND_API_KEY", "re_test_key_123"), \
         patch.object(settings, "RESEND_FROM_EMAIL", "onboarding@resend.dev"), \
         patch.object(settings, "GMAIL_CLIENT_ID", "client_id_test"), \
         patch.object(settings, "GMAIL_CLIENT_SECRET", "client_sec_test"), \
         patch.object(settings, "GMAIL_REFRESH_TOKEN", "bad_refresh_token"), \
         patch.object(settings, "GMAIL_FROM_EMAIL", "test@gmail.com"), \
         patch.object(settings, "SMTP_USERNAME", "smtp_user"), \
         patch.object(settings, "SMTP_PASSWORD", "smtp_pass"), \
         patch("httpx.AsyncClient.post") as mock_resend_post, \
         patch("app.services.auth_service.send_email_using_gmail_api", new_callable=AsyncMock) as mock_gmail_api, \
         patch("smtplib.SMTP") as mock_smtp:

        # Resend returns 403
        mock_resend_response = MagicMock()
        mock_resend_response.status_code = 403
        mock_resend_response.text = '{"message": "domain not verified"}'
        mock_resend_post.return_value = mock_resend_response

        # Gmail API fails
        mock_gmail_api.return_value = False

        # SMTP fails with Render Errno 101 Network is unreachable
        mock_smtp.side_effect = OSError(101, "Network is unreachable")

        with pytest.raises(HTTPException) as exc_info:
            await send_email(
                to_email="arbitrary@example.com",
                subject="Test Subject",
                html_body="<p>Test</p>",
            )

        assert exc_info.value.status_code == 500
        assert exc_info.value.detail == "Unable to send OTP email. Please try again later."
        # Verify no credentials leaked in error detail
        assert "re_test_key_123" not in exc_info.value.detail
        assert "smtp_pass" not in exc_info.value.detail


@pytest.mark.asyncio
async def test_5_forgot_password_uses_common_send_email():
    """TEST 5: Password reset email uses the common send_email service and template."""
    with patch("app.services.auth_service.send_email", new_callable=AsyncMock) as mock_send_email:
        await send_password_reset_email(
            email="reset@example.com",
            name="John Doe",
            reset_link="https://app.example.com/reset-password?token=abc",
            expiry_minutes=15,
        )

        assert mock_send_email.called
        kwargs = mock_send_email.call_args.kwargs
        assert kwargs["to_email"] == "reset@example.com"
        assert kwargs["subject"] == "Reset Your Interviewer Buddy AI Password"
        assert "https://app.example.com/reset-password?token=abc" in kwargs["html_body"]


@pytest.mark.asyncio
async def test_6_signup_otp_uses_common_send_email():
    """TEST 6: Signup OTP email uses the common send_email service and template."""
    with patch("app.services.auth_service.send_email", new_callable=AsyncMock) as mock_send_email:
        await send_signup_otp(
            email="signup@example.com",
            name="Jane Doe",
            otp="123456",
        )

        assert mock_send_email.called
        kwargs = mock_send_email.call_args.kwargs
        assert kwargs["to_email"] == "signup@example.com"
        assert kwargs["subject"] == "Verify Your Interviewer Buddy AI Account"
        assert "123456" in kwargs["html_body"]
