---
title: "Derangement Can Solve Your Problems"
description: "Here is a very fun and surprising result which is not really new, but if you haven't seen it, you really should. The problem looks like this: I had a…"
pubDate: 2012-10-22
tags: [probability, combinatorics]
draft: false
legacy: true
cover: "/images/2012/10/hats.jpg"
coverFit: contain
---

## Men Without Hats
Here is a very fun and surprising result which is not really new, but if you haven't seen it, you really should. The problem looks like this:

[![](/images/2012/10/hats-150x150.jpg "hats")](/images/2012/10/hats.jpg)One-hundred men throw their hats into a closet. Each one randomly selects one of the hats until all of them have a hat again. At the end of the process, how many men do we expect to have their own hat?

I had a professor who gave us the answer to this question, and put it on every test he gave, but never actually proved it, so today I'm going to do it. I'm actually going to solve this problem (and the more general one, with $N$ men and $N$ hats) in two different ways, but let's start with a brute force approach.

## If you don't feel like reading the details, skip to the end now for the answer.
## Counting Every Case
First, consider the trivial case of one man and one hat. Well, obviously he gets his hat back so we expect, and in fact it has been uniquely determined as the singular outcome, that one man will end up with his own hat.

The case of two men is the first interesting one. Here, there are two outcomes:

1. Each man gets the other's hat, and hence no men get their hat back.
2. Each man gets his own hat.

Both events are equally likely, so they occur with probability $\frac{1}{2}$, and we now have enough information to calculate the expected value:

If $X$ is the number of men who get their own hat back,

$E[X] = \sum(Pr(X=n) * n) = \frac{1}{2} (0) + \frac{1}{2} (2) = 0 + 1 = 1$

This is a neat result, but still doesn't give us enough info to establish a pattern. Let's give three men a try and see what develops.

This will require a small amount of bookkeeping, but essentially, there are three things that could happen:

* **Everyone gets his hat back**: This only happens in one of the $3! = 6$ possible hat permutations.
* **One man gets his hat back**: Here, the other two trade. This can happen three ways, one way for each man.
* **No man gets his own hat back**: This can happen two ways, either each man passes his hat to the right, or each man passes his hat to the left.
* Notice that there is no way for **exactly two men to get their own hat**, because this would leave the third man with his hat as well, which is already covered by case 1 above.

We're now in a position to calculate the expected value:

$E[X] = \frac{1}{6} (3) + 0(2) + \frac{3}{6} (1) + \frac{2}{6} (0) = \frac{3}{6} + 0 + \frac{3}{6} + 0 = 1$. Interesting! Perhaps a pattern is forming after all, though not what we might have expected. Let's brute force one more case and then try to generalize:

For four men, there are $4! = 24$ permutations. We'll consider five sub-cases corresponding to zero, one, two, three, and four men who get their own hat. Each configuration has two groups of men - those who got their hat back, and those who didn't. Let's examine the possible outcomes through this lens. My approach here will be to answer the following two questions for each case:

* How many ways can we select a unique group who get their hats back?
* Once that group is chosen, how many ways can we rearrange the hats in the other group so that **none** of them get their own hat back?

The number of arrangements for each of the five configurations will be the product of the answers to these two questions. And the probability of each configuration is this product divided by twenty-four, the total number of permutations. Let's look at some hard numbers for clarity:

* **All four men get their hat back**: The number of ways this can happen is simply ${4 \choose 4}$ or $1$. Obviously there are no men who don't get their hat back, so that can only happen in one way. That gives us $1 * 1 = 1$ configuration in this category.[![](/images/2012/10/four_men.png "four_men")](/images/2012/10/four_men.png)
* **Three men get their hat back**: This can happen ${4 \choose 3} = 4$ ways, but this should leave one man in the group of men who don't get their hat back. This can't happen (or we could say it can happen in zero ways). That means there are $4 * 0 = 0$ configurations in this case.[![](/images/2012/10/three_men.png "three_men")](/images/2012/10/three_men.png)
* **Two men get their hats back**: Of course, this can happen in ${4 \choose 2} = 6$ ways, but we must also be sure the other two don't get their hats back, which can only happen one way - if they trade. So, in total, we have $6 * 1 = 6$ configurations in this category.[![](/images/2012/10/two_men.png "two_men")](/images/2012/10/two_men.png)
* **Only one man gets his hat back**: This can happen in ${4 \choose 1} =4$ ways, but again, we must guarantee that the other three each get someone else's hat. We've already seen that for three men, there are two ways in which none of them get their hat back (passing to the left and to the right). That gives $4 * 2 = 8$ total cases in this category[![](/images/2012/10/one_man.png "one_man")](/images/2012/10/one_man.png)
* **None get their hat back:** Since we've already accounted for $1 + 0 + 6 + 8 = 15$ of the $24$ cases, that leaves only $9$ in this group.

Again, we can calculate the expected value:

$E[X] = (4)\frac{1}{24} + (3)\frac{0}{24} + (2)\frac{6}{24} + (1)\frac{8}{24} + (0)\frac{9}{24} = 1$

This should give us the strong suspicion that the answer is always going to be one. Think about that. No matter how many people randomly shuffle their hats, can it really be true that, on average, one person gets their hat back? Well, without a general formula, we'll never know, so let's build that.

## Derangement is your friend - no, really
The groundwork has already been laid, but we're missing one piece, a function to represent the answer to that second question, how many ways can we rearrange the hats so that no one gets his own back? For one, two, three, and four men, the number is zero, one, two, and nine. Is there a function that follows this pattern? As it turns out, there is! It's called the [subfactorial](http://en.wikipedia.org/wiki/Subfactorial) and it measures the number of something called derangements of a set. How can that fail to be awesome? It can't.

[![](/images/2012/10/permutations-300x295.gif "permutations")](/images/2012/10/permutations.gif)A derangement of an ordered set is a permutation that leaves no element in the same position in which it started. But that's exactly what we're trying to measure! The number of derangements of a set of $n$ elements is represented by the subfactorial function, $!n$. The formula for this function can be represented in many ways, but probably the simplest is:

$!n = [\frac{n!}{e}]$
Where [] is the rounding function and $e$ is Euler's constant.

Now, we can write a general formula for $n$ men:

$E[X] = \sum_{r=0}^{n}{(r)\frac{{n \choose r}(!n)}{n!}}$

I won't go about proving that this always equals one because it's sort of hard to type it all out and I'd much rather play video games than do that. I will give you a place to get started, though. Try running the following query at [wolfram alpha](http://www.wolframalpha.com/):

**sum(subfactorial(n-x)x(binomial(n,x))/n!,x=0..n)**

That's as far down that path as I'll walk today, but before ending the conversation let me show you a much easier way to solve the problem, even if it doesn't include any funny mathematical terms.

## The Easy Way Out
For this proof, let's define $X_{i}$ as the event that the $ith$ man gets his own hat back. Let's also introduce a fairly boring function, called the indicator function, $I(A)$, which evaluates to $1$ if the event $A$ is true, and $0$ otherwise. Now, let's find the expectation value of $I(X_{i})$. Assuming that we are dealing with $N$ hats and $N$ men:

$E[I(X_{i})] = 1 * Pr(X_{i}) + 0 * Pr(\neg X_{i}) = 1 * \frac{1}{N} + 0 * \frac{N-1}{N} = \frac{1}{N}$

Now, let's see why I did all that. Finally, define $X= \sum_{i=1}^{n}I(X_{i})$,  the total number of men who get their own hat back, and calculate its expected value:

$E[X] = E[\sum_{i=1}^{n}I(X_{i})] = \sum_{i=0}^{n}E[I(X_{i})] = \sum_{i=0}^{n}(\frac{1}{N}) = N * \frac{1}{N} = 1$

I've actually done a lot of things here that need justification, but I'm skipping them because they're not fun and I'm not in school any more so I don't have to. At the very least, though, you now have a good idea why I could get away with mindlessly scrawling $1$ on the page every time I was asked this question. Have fun quizzing your friends with this one.

***For those who skipped***: The answer is $1$ no matter how many men are involved! If you don't believe me, I know a great blog you should read...
