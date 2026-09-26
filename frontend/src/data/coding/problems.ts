import { CodingProblem } from '@/types/coding';

export const codingProblems: CodingProblem[] = [
  {
    id: 'two-sum',
    number: 1,
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    topics: ['Array', 'Hash Table'],
    acceptance: '53.8%',
    companies: ['Google', 'Amazon', 'Microsoft', 'Deloitte'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly one solution***, and you may not use the *same* element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    hints: [
      'A really brute force way would be to search for all possible pairs of numbers but that would be slow (O(n²)).',
      'Can you use extra space (like a Hash Map) to check if the complement (target - nums[i]) has already been seen in O(1)?',
    ],
    starterCodes: {
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []
`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
`,
      cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.find(complement) != seen.end()) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};
`,
      java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    int* res = (int*)malloc(2 * sizeof(int));
    *returnSize = 2;
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                res[0] = i;
                res[1] = j;
                return res;
            }
        }
    }
    *returnSize = 0;
    return NULL;
}
`,
      go: `package main

func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        complement := target - num
        if idx, ok := seen[complement]; ok {
            return []int{idx, i}
        }
        seen[num] = i
    }
    return []int{}
}
`,
      csharp: `using System;
using System.Collections.Generic;

public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        var map = new Dictionary<int, int>();
        for (int i = 0; i < nums.Length; i++) {
            int complement = target - nums[i];
            if (map.ContainsKey(complement)) {
                return new int[] { map[complement], i };
            }
            map[nums[i]] = i;
        }
        return new int[0];
    }
}
`,
    },
    testCases: [
      {
        id: 1,
        input: 'nums = [2, 7, 11, 15], target = 9',
        expectedOutput: '[0, 1]',
        explanation: 'nums[0] + nums[1] = 2 + 7 = 9',
      },
      {
        id: 2,
        input: 'nums = [3, 2, 4], target = 6',
        expectedOutput: '[1, 2]',
        explanation: 'nums[1] + nums[2] = 2 + 4 = 6',
      },
      {
        id: 3,
        input: 'nums = [3, 3], target = 6',
        expectedOutput: '[0, 1]',
      },
    ],
  },
  {
    id: 'valid-parentheses',
    number: 20,
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    topics: ['String', 'Stack'],
    acceptance: '40.6%',
    companies: ['Amazon', 'Google', 'Microsoft', 'TCS'],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.',
    ],
    hints: [
      'Use a stack to keep track of the most recently opened bracket.',
      'When encountering a closing bracket, check if the stack top is the matching open bracket.',
    ],
    starterCodes: {
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your code here
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        for char in s:
            if char in mapping:
                top = stack.pop() if stack else '#'
                if mapping[char] != top:
                    return False
            else:
                stack.append(char)
        return not stack
`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your code here
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if (map[c]) {
      if (stack.pop() !== map[c]) return false;
    } else {
      stack.push(c);
    }
  }
  return stack.length === 0;
}
`,
      cpp: `#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') st.push(c);
            else {
                if (st.empty()) return false;
                char top = st.top(); st.pop();
                if ((c == ')' && top != '(') ||
                    (c == '}' && top != '{') ||
                    (c == ']' && top != '[')) return false;
            }
        }
        return st.empty();
    }
};
`,
      java: `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}
`,
      c: `#include <stdbool.h>
#include <string.h>

bool isValid(char* s) {
    int len = strlen(s);
    char stack[len + 1];
    int top = -1;
    for (int i = 0; i < len; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') stack[++top] = c;
        else {
            if (top == -1) return false;
            char t = stack[top--];
            if ((c == ')' && t != '(') ||
                (c == '}' && t != '{') ||
                (c == ']' && t != '[')) return false;
        }
    }
    return top == -1;
}
`,
      go: `package main

func isValid(s string) bool {
    var stack []rune
    pairs := map[rune]rune{')': '(', '}': '{', ']': '['}
    for _, c := range s {
        if open, exists := pairs[c]; exists {
            if len(stack) == 0 || stack[len(stack)-1] != open {
                return false
            }
            stack = stack[:len(stack)-1]
        } else {
            stack = append(stack, c)
        }
    }
    return len(stack) == 0
}
`,
      csharp: `using System.Collections.Generic;

public class Solution {
    public bool IsValid(string s) {
        var stack = new Stack<char>();
        foreach (char c in s) {
            if (c == '(') stack.Push(')');
            else if (c == '{') stack.Push('}');
            else if (c == '[') stack.Push(']');
            else if (stack.Count == 0 || stack.Pop() != c) return false;
        }
        return stack.Count == 0;
    }
}
`,
    },
    testCases: [
      { id: 1, input: 's = "()"', expectedOutput: 'true' },
      { id: 2, input: 's = "()[]{}"', expectedOutput: 'true' },
      { id: 3, input: 's = "(]"', expectedOutput: 'false' },
    ],
  },
  {
    id: 'longest-substring-without-repeating-characters',
    number: 3,
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    acceptance: '34.9%',
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.',
      },
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.',
    ],
    hints: [
      'Maintain a sliding window [left, right] of unique characters.',
      'When a duplicate is encountered at right, move left past the previous occurrence.',
    ],
    starterCodes: {
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_map = {}
        left = 0
        max_len = 0
        for right, char in enumerate(s):
            if char in char_map and char_map[char] >= left:
                left = char_map[char] + 1
            char_map[char] = right
            max_len = max(max_len, right - left + 1)
        return max_len
`,
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  const map = new Map();
  let left = 0;
  let maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right]) && map.get(s[right]) >= left) {
      left = map.get(s[right]) + 1;
    }
    map.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
`,
      cpp: `#include <string>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> last(256, -1);
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); ++right) {
            if (last[(unsigned char)s[right]] >= left) {
                left = last[(unsigned char)s[right]] + 1;
            }
            last[(unsigned char)s[right]] = right;
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};
`,
      java: `import java.util.*;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}
`,
      c: `#include <string.h>

int lengthOfLongestSubstring(char* s) {
    int last[256];
    for (int i = 0; i < 256; i++) last[i] = -1;
    int maxLen = 0, left = 0, len = strlen(s);
    for (int right = 0; right < len; right++) {
        unsigned char c = (unsigned char)s[right];
        if (last[c] >= left) {
            left = last[c] + 1;
        }
        last[c] = right;
        int curr = right - left + 1;
        if (curr > maxLen) maxLen = curr;
    }
    return maxLen;
}
`,
      go: `package main

func lengthOfLongestSubstring(s string) int {
    last := make(map[rune]int)
    maxLen, left := 0, 0
    for right, c := range s {
        if idx, ok := last[c]; ok && idx >= left {
            left = idx + 1
        }
        last[c] = right
        if right-left+1 > maxLen {
            maxLen = right - left + 1
        }
    }
    return maxLen
}
`,
      csharp: `using System;
using System.Collections.Generic;

public class Solution {
    public int LengthOfLongestSubstring(string s) {
        var map = new Dictionary<char, int>();
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.Length; right++) {
            char c = s[right];
            if (map.ContainsKey(c) && map[c] >= left) {
                left = map[c] + 1;
            }
            map[c] = right;
            maxLen = Math.Max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}
`,
    },
    testCases: [
      { id: 1, input: 's = "abcabcbb"', expectedOutput: '3' },
      { id: 2, input: 's = "bbbbb"', expectedOutput: '1' },
      { id: 3, input: 's = "pwwkew"', expectedOutput: '3' },
    ],
  },
  {
    id: 'merge-intervals',
    number: 56,
    title: 'Merge Intervals',
    slug: 'merge-intervals',
    difficulty: 'Medium',
    topics: ['Array', 'Sorting'],
    acceptance: '47.1%',
    companies: ['Google', 'Amazon', 'Microsoft', 'Deloitte'],
    description: `Given an array of \`intervals\` where \`intervals[i] = [starti, endi]\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.`,
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].',
      },
      {
        input: 'intervals = [[1,4],[4,5]]',
        output: '[[1,5]]',
        explanation: 'Intervals [1,4] and [4,5] are considered overlapping.',
      },
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti <= endi <= 10^4',
    ],
    hints: [
      'Sort the intervals by their start times.',
      'Iterate through the sorted intervals. If the current interval overlaps with the previous one, merge them by updating the end time.',
    ],
    starterCodes: {
      python: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        intervals.sort(key=lambda x: x[0])
        merged = []
        for interval in intervals:
            if not merged or merged[-1][1] < interval[0]:
                merged.append(interval)
            else:
                merged[-1][1] = max(merged[-1][1], interval[1])
        return merged
`,
      javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [];
  for (const interval of intervals) {
    if (!result.length || result[result.length - 1][1] < interval[0]) {
      result.push(interval);
    } else {
      result[result.length - 1][1] = Math.max(result[result.length - 1][1], interval[1]);
    }
  }
  return result;
}
`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> merged;
        for (const auto& interval : intervals) {
            if (merged.empty() || merged.back()[1] < interval[0]) {
                merged.push_back(interval);
            } else {
                merged.back()[1] = max(merged.back()[1], interval[1]);
            }
        }
        return merged;
    }
};
`,
      java: `import java.util.*;

class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> merged = new ArrayList<>();
        for (int[] interval : intervals) {
            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < interval[0]) {
                merged.add(interval);
            } else {
                merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], interval[1]);
            }
        }
        return merged.toArray(new int[merged.size()][]);
    }
}
`,
      c: `#include <stdlib.h>

int compare(const void* a, const void* b) {
    int* rowA = *(int**)a;
    int* rowB = *(int**)b;
    return rowA[0] - rowB[0];
}

int** merge(int** intervals, int intervalsSize, int* intervalsColSize, int* returnSize, int** returnColumnSizes) {
    // Merge intervals logic
    *returnSize = 0;
    return NULL;
}
`,
      go: `package main

import "sort"

func merge(intervals [][]int) [][]int {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0]
    })
    var res [][]int
    for _, item := range intervals {
        if len(res) == 0 || res[len(res)-1][1] < item[0] {
            res = append(res, item)
        } else if item[1] > res[len(res)-1][1] {
            res[len(res)-1][1] = item[1]
        }
    }
    return res
}
`,
      csharp: `using System;
using System.Collections.Generic;

public class Solution {
    public int[][] Merge(int[][] intervals) {
        Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
        var res = new List<int[]>();
        foreach (var interval in intervals) {
            if (res.Count == 0 || res[res.Count - 1][1] < interval[0]) {
                res.Add(interval);
            } else {
                res[res.Count - 1][1] = Math.Max(res[res.Count - 1][1], interval[1]);
            }
        }
        return res.ToArray();
    }
}
`,
    },
    testCases: [
      {
        id: 1,
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        expectedOutput: '[[1,6],[8,10],[15,18]]',
      },
      {
        id: 2,
        input: 'intervals = [[1,4],[4,5]]',
        expectedOutput: '[[1,5]]',
      },
    ],
  },
  {
    id: 'trapping-rain-water',
    number: 42,
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'Hard',
    topics: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    acceptance: '60.3%',
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [
      {
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The elevation map traps 6 units of rain water.',
      },
      {
        input: 'height = [4,2,0,3,2,5]',
        output: '9',
      },
    ],
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5',
    ],
    hints: [
      'For each bar, the amount of water trapped is min(max_left, max_right) - height[i].',
      'Can you solve this in O(n) time and O(1) auxiliary space using two pointers moving inward?',
    ],
    starterCodes: {
      python: `class Solution:
    def trap(self, height: list[int]) -> int:
        if not height:
            return 0
        left, right = 0, len(height) - 1
        left_max, right_max = height[left], height[right]
        water = 0
        while left < right:
            if left_max < right_max:
                left += 1
                left_max = max(left_max, height[left])
                water += left_max - height[left]
            else:
                right -= 1
                right_max = max(right_max, height[right])
                water += right_max - height[right]
        return water
`,
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let total = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else total += leftMax - height[left];
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else total += rightMax - height[right];
      right--;
    }
  }
  return total;
}
`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
};
`,
      java: `class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
}
`,
      c: `int trap(int* height, int heightSize) {
    int left = 0, right = heightSize - 1;
    int leftMax = 0, rightMax = 0, water = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) leftMax = height[left];
            else water += leftMax - height[left];
            left++;
        } else {
            if (height[right] >= rightMax) rightMax = height[right];
            else water += rightMax - height[right];
            right--;
        }
    }
    return water;
}
`,
      go: `package main

func trap(height []int) int {
    left, right := 0, len(height)-1
    leftMax, rightMax, water := 0, 0, 0
    for left < right {
        if height[left] < height[right] {
            if height[left] >= leftMax {
                leftMax = height[left]
            } else {
                water += leftMax - height[left]
            }
            left++
        } else {
            if height[right] >= rightMax {
                rightMax = height[right]
            } else {
                water += rightMax - height[right]
            }
            right--
        }
    }
    return water
}
`,
      csharp: `using System;

public class Solution {
    public int Trap(int[] height) {
        int left = 0, right = height.Length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
}
`,
    },
    testCases: [
      {
        id: 1,
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        expectedOutput: '6',
      },
      {
        id: 2,
        input: 'height = [4,2,0,3,2,5]',
        expectedOutput: '9',
      },
    ],
  },
  {
    id: 'reverse-linked-list',
    number: 206,
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    difficulty: 'Easy',
    topics: ['Linked List', 'Recursion'],
    acceptance: '76.2%',
    companies: ['Amazon', 'Google', 'Microsoft', 'TCS', 'Deloitte'],
    description: `Given the \`head\` of a singly linked list, reverse the list, and return *the reversed list*.`,
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]',
      },
      {
        input: 'head = [1,2]',
        output: '[2,1]',
      },
      {
        input: 'head = []',
        output: '[]',
      },
    ],
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000',
    ],
    hints: [
      'Iterative approach: Maintain prev, curr, and next pointers.',
      'Can you also think about the recursive solution?',
    ],
    starterCodes: {
      python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head):
        prev = None
        curr = head
        while curr:
            next_node = curr.next
            curr.next = prev
            prev = curr
            curr = next_node
        return prev
`,
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    const nextTemp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }
  return prev;
}
`,
      cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr) {
            ListNode* nxt = curr->next;
            curr->next = prev;
            prev = curr;
            curr = nxt;
        }
        return prev;
    }
};
`,
      java: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}
`,
      c: `struct ListNode* reverseList(struct ListNode* head) {
    struct ListNode* prev = NULL;
    struct ListNode* curr = head;
    while (curr) {
        struct ListNode* nxt = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}
`,
      go: `package main

type ListNode struct {
    Val int
    Next *ListNode
}

func reverseList(head *ListNode) *ListNode {
    var prev *ListNode
    curr := head
    for curr != nil {
        nxt := curr.Next
        curr.Next = prev
        prev = curr
        curr = nxt
    }
    return prev
}
`,
      csharp: `public class Solution {
    public ListNode ReverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}
`,
    },
    testCases: [
      { id: 1, input: 'head = [1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' },
      { id: 2, input: 'head = [1,2]', expectedOutput: '[2,1]' },
    ],
  },
];

export function getCodingProblemById(id: string): CodingProblem | undefined {
  return codingProblems.find((p) => p.id === id || p.slug === id);
}

export function getCodingProblemsByCompany(companyName: string): CodingProblem[] {
  const norm = companyName.toLowerCase();
  return codingProblems.filter(
    (p) => p.companies?.some((c) => c.toLowerCase() === norm),
  );
}
