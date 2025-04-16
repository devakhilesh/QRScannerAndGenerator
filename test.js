var merge = function (nums1, m, nums2, n) {
  console.log(nums1.length, m);

  let limit = nums1.length - m;

  for (let i = 0; i < limit; i++) {
    console.log(nums1.unshift(), "llll");
  }

  console.log(nums1, "kkkkkk");
  console.log(nums2.length, m);

  let limit2 = nums2.length - n;
  console.log(limit2);
  for (let i = 0; i < limit2; i++) {
    nums2.unshift();
  }

  console.log(nums1, nums2);
  let numm = [...nums1, ...nums2];

  numm.sort((a, b) => a - b);

  return numm;
};

let nums1 = [1, 2, 3, 0, 0, 0];
let m = 3;
let nums2 = [2, 5, 6];
let n = 3;

console.log("function call", merge(nums1, m, nums2, n));
