---
title: "When Will This Game End?"
description: "As it turns out, the NCAA publishes every overtime game including the number of overtimes. We'll come back to this later, but I decided to ask a more…"
pubDate: 2012-11-24
tags: [probability, markov-chains, football]
draft: false
legacy: true
---

# Geez, This Is Taking Forever!

![](http://icons.iconseeker.com/png/fullsize/superbuuf/football-4.png)A short time ago, I watched my hometown college football team come back to tie a game in the fourth quarter, triggering overtime. Because overtime is so much fun to watch, I immediately wondered how long it would last. That particular game ended in two overtimes, but I decided I'd like to know how many overtimes one can usually expect.

As it turns out, the NCAA publishes every overtime game including the number of overtimes. We'll come back to this later, but I decided to ask a more interesting question instead. I wondered whether regulation time performance matches overtime performance well enough to predict the average number of overtimes.

## Where To Start?

For reference, let's pause to describe the rules of overtime. Briefly, they are as follows:

![](http://www.boston.com/sports/football/patriots/extra_points/t1_board_si.jpg)Each team gets a chance to score from the opposing team's 25 yard line. A tie at the end of the round invokes another round. After the second round, any team scoring a touchdown must attempt a two-point conversion.

Although there are other rules, for instance, if the team playing defense scores on a turnover, the game automatically ends, but this is the basic outline.

## Data-Mining Requires Data

Well, it would really be nice if we had a large data set of teams starting a drive from the opposing team's 25 yard line to see how often each type of score occurs from that starting position. As it turns out, the NCAA publishes this data on a regular basis, and even better, the good folks at [cfbstats.com](http://www.cfbstats.com/) actually compile it all into wonderful little year-by-year [file nuggets](http://www.cfbstats.com/blog/college-football-data/).

Using the data from 2005-2011, I found 975 such drives. I eliminated twenty of them, because they resulted in the end of the half, meaning that the team either didn't play offense (took a knee), or didn't have enough time to score, neither of which ever happen in overtime. The breakdown of the remaining 955 drives looks like this:[![](/images/2012/11/Drive_Results.png "Drive_Results")](/images/2012/11/Drive_Results.png)

As you might have expected, there are a lot of touchdowns and field goals, and relatively few scoreless drives, which happen for various reasons.

This gets me most of the way to learning what the score might be after a drive from the 25, but I also need to know the hit rate for extra points and two point conversions. Thankfully, the [NCAA provides that](http://fs.ncaa.org/Docs/stats/football_records/2012/fbs.pdf) as well. Here are those numbers for the same years (2005 - 2011):

[![](/images/2012/11/hit_rates.png "hit_rates")](/images/2012/11/hit_rates.png)

There is not much variance in extra point hit rates over the years, and only a moderate amount in two-point conversion rates. Still, it's best to take the largest sample you can, so I'll use the cumulative averages as my hit rates.

## All That's Left Is The Math

Now it's time to cook these data! For each round, we need to estimate the probability of ending in a tie, or put another way, whether the game continues. First, let's note that any drive can result in a score of 0, 3, 6, or 7 for rounds one and two of overtime.

The data above are enough to calculate the probability of each type of score. Then, I can just square each one and add them all up to get the probability of a tie. In rounds three and higher, I can do the same, but use the two-point conversion rate instead of the extra point rate. The result: a transition probability matrix!
[![](/images/2012/11/matrix_legend.png "matrix_legend")](/images/2012/11/matrix_legend.png)[![](/images/2012/11/transition_matrix.png "transition_matrix")](/images/2012/11/transition_matrix.png)That's right, we're going to treat overtime like a Markov chain and use it to find the average number of steps before the game ends (absorption time in Markov parlance). Since I've done similar work for my [analysis of Monopoly](/blog/how-long-will-it-take-to-get-to-free-parking/ "How long will it take to get to Free Parking?"), I'll space the gory details and get straight to the results. If you're really nerdy and want to see all of the calculations, including the original drive chart analysis, take a peek at my [excel worksheet](/files/2005-2011_drive_charts-overtimes.xlsx).

## Results

[![](/images/2012/11/ot_results.png "ot_results")](/images/2012/11/ot_results.png)To the right, you can see the average number of overtimes it takes to get to the end of the game. So, for instance, starting from the second overtime, it takes 1.46+ rounds, on average, to reach a conclusion. That means that by this method, the average number of overtimes is about 1.51. Remember I told you the NCAA actually publishes the overtime data? Well, let's compare and see how we did. It turns out the average number of overtimes for the same period I used in my calculations was about 1.41, for a difference of about 7%. Well, I'll count that as a win (even though my home team lost their OT game)!

## Problems With This Approach
[![](/images/2012/11/83568880.jpg "83568880")](/images/2012/11/83568880.jpg)The very critical reader will have noticed that I made a couple of implicit assumptions. I took care not to state them when writing the analysis, but I think they're worth mentioning.

* It can be argued that teams really do perform differently in overtime because at the end of the game, they are more tired, thus, the outcomes of any given drive would be different. This is a fair point, however, I don't have a good way to quantify it, so I have to assume that it affects both teams equally, and doesn't affect whether a given OT session will end in a tie.
* If the first team scores a touchdown, the second team will not go for a field goal. This may indeed account for some or all of the difference between my result and the actual results, but again, I have no really slick way to quantify this information, so I've left it alone. Furthermore, this matters in fewer than 25% of all overtimes.

All in all I was surprised by the average being so low. I honestly expected it to be more than 2 overtimes, however, I was still pretty pleased with the result of this analysis. Oh, and if you're still wondering about my poor [hometown team](http://espn.go.com/college-football/team/_/id/97/louisville-cardinals), they actually did pretty well this year.
