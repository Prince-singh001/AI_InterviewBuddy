import { SupportedLanguage } from '@/types/coding';

export const languageList: {
  id: SupportedLanguage;
  name: string;
  extension: string;
  monacoLang: string;
  version: string;
}[] = [
  {
    id: 'python',
    name: 'Python',
    extension: 'py',
    monacoLang: 'python',
    version: '3.11',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    monacoLang: 'javascript',
    version: 'ES2023',
  },
  {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    monacoLang: 'cpp',
    version: 'GCC 13 (C++20)',
  },
  {
    id: 'java',
    name: 'Java',
    extension: 'java',
    monacoLang: 'java',
    version: 'OpenJDK 21',
  },
  {
    id: 'c',
    name: 'C',
    extension: 'c',
    monacoLang: 'c',
    version: 'GCC 13 (C17)',
  },
  {
    id: 'go',
    name: 'Go',
    extension: 'go',
    monacoLang: 'go',
    version: 'Go 1.22',
  },
  {
    id: 'csharp',
    name: 'C#',
    extension: 'cs',
    monacoLang: 'csharp',
    version: '.NET 8',
  },
];

export const defaultStarterCodes: Record<SupportedLanguage, string> = {
  python: `class Solution:
    def solve(self, nums: list[int], target: int) -> list[int]:
        # Write your code here
        pass
`,
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solve(nums, target) {
  // Write your code here
  return [];
}
`,
  cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> solve(vector<int>& nums, int target) {
        // Write your code here
        return {};
    }
};
`,
  java: `import java.util.*;

class Solution {
    public int[] solve(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}
`,
  c: `#include <stdio.h>
#include <stdlib.h>

/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* solve(int* nums, int numsSize, int target, int* returnSize) {
    // Write your code here
    *returnSize = 0;
    return NULL;
}
`,
  go: `package main

func solve(nums []int, target int) []int {
    // Write your code here
    return []int{}
}
`,
  csharp: `using System;
using System.Collections.Generic;

public class Solution {
    public int[] Solve(int[] nums, int target) {
        // Write your code here
        return new int[0];
    }
}
`,
};
