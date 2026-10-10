---
title: "Learning to play Mancala"
description: "Because I love genetic algorithms and video games, I always wanted to create some artificial intelligence that learns to play a game. My first attempt is…"
pubDate: 2012-07-19
tags: [games, ai, strategy]
draft: false
legacy: true
---

Because I love genetic algorithms and video games, I always wanted to create some artificial intelligence that learns to play a game. My first attempt is the subject of this entry.

A college friend and roommate of mine once showed me how he used a GA to solve the two bishops chess endgame scenario from any position. I decided that it would be fun, and within my capabilities to focus on a simpler game, Mancala.

## What's a Genetic Algorithm?
A GA is just a search. If a search space is simply too large to enumerate in a reasonable amount of time, a GA provides a means of finding a "good enough" solution without searching through every possible one. In practice, this usually means waiting quite some time (maybe a few days) for the algorithm to run, but the reward is usually a damn good solution. [![](/images/2012/07/dna.jpg "dna")](/images/2012/07/dna.jpg)A GA attempts to model biological evolution by simplifying it to three stages. After starting with a potential pool of solutions, we assign each of them a fitness value, select the ones with the "best" fitness (selection), use them to create "offspring" solutions (crossover), optionally mutate the offspring (mutation), and start again with the newly created pool of solutions. Let's see how this applies to the Mancala game.

## What's a Mancala?
Mancala is a very simple two-player, turn-based board game where each player has a row of buckets with some stones in them and a scoring bin. Each player takes a turn by emptying one of the buckets and placing one stone in each consecutive bucket (including the scoring bin) until no stones remain. There are a few [other rules](http://en.wikipedia.org/wiki/Mancala), but the object is to finish with the most stones in your scoring bin.

In a somewhat unfortunate circumstance, I found out after implementing my algorithm that Mancala is a [solved game](http://en.wikipedia.org/wiki/Solved_game#Solved_games), meaning that someone has figured out the perfect move for every position, and given that both players know the perfect move, the outcome is predetermined. The most familiar example of a solved game is probably tic-tac-toe. It's easy to guarantee a draw, even if you don't get the first move. Now, forgetting that we ever saw this, let's go searching.

## How to Teach a Computer to Play:
We need just a few things to build an algorithm - a way to value the current game board (this is the AI part, which I will henceforth call a "strategy"), a way to select the best strategies, a way to create new strategies from old ones, and a way to mutate strategies. These methods will define a GA which helps us efficiently search the space of all possible strategies.

## Choosing a Valuation Strategy
I chose to value the current state of the board based upon three properties - the net score ($S$), the net number of stones on the player's side of the board ($B$), and the net number of stones which must eventually advance to the opponent's side of the board ($O$). For example, in the following position, the player controlling the bottom six bins scores in the rightmost bin.

[![](/images/2012/07/mancalaSampleBoard.png "mancalaSampleBoard")](/images/2012/07/mancalaSampleBoard.png)

That player would calculate the following values for the parameters described:

The player's score is $5$. The opponent's score is $6$, so the net score would be $-1$. The player controls $7 + 2 + 3 + 2 = 14$ stones, while the opponent controls $8 + 7 + 6 + 2 = 23$ stones, netting $-9$. To calculate the overflow parameter, note that choosing bin $(6)$ would result in one score plus one stone on the opponent's side of the board. Choosing bin $(5)$ would drop one stone in bin $(6)$, score one, and result in one overflow, while choosing bin $(1)$ would also yield one overflow, bringing the player's overflow value to $3$. The opponent's overflow would be $6$, using the same method, so the net overflow for this player in this position is $6 - 3 = 3$. I reverse the order of subtraction here because overflow is actually bad for the player, who wants to score without giving the opponent a chance to do so. A given strategy ($W$) consists of creating a set of weights for these parameters.

$W = <S_{w}, B_{w}, O_{w}>$

I've chosen to restrict the weights to the range $[0,1]$ for no other reason than simplicity. Now, we can give the board a value ($V$), based on our strategy:

$V = S * S_{w} + B * B_{w} + O * O_{w}$

If we just so happened to choose values $W = <.1, .1, .9>$, for our weights, we'd get a board valuation of:

$V = (-1)*.1 + (-9)*.1 + 3*.9 = 1.7$, leading us to believe that this position is pretty favorable. Since it is, in fact, not favorable at all, we would expect this strategy to lose quite often, and therefore not survive the round of selection, described below.

I should quickly note why this valuation is important. Since, Mancala is a two-player, turn-based game, we can employ a [minimax](http://en.wikipedia.org/wiki/Minimax) algorithm when deciding to make a move. This roughly means that on each turn we look at the move that maximizes the board value for us, while leaving the opponent the least room to improve their board value. The deeper we search in the move list, the better we can limit our opponents moves. I chose to search seven moves deep mostly because I didn't want to run the algorithm for any more than two days,  : ).

The minimax algorithm could be the topic of its own post, but I'll save that for a later date because we need to get on to the business of selecting strategies for crossover.

## Assigning Fitness
I chose to have every strategy in the pool play against every other strategy twice, alternating who goes first, and define "fitness" for each strategy as the number of wins it achieved that round. Once fitness is determined for each strategy in the pool (i.e. every match has been decided), I chose two parent strategies at random, but proportional to their fitness, for the crossover phase, which creates the next pool of strategies.

For a simple example, suppose the pool size were $4$. That means there are twelve matches played in each round. Suppose the first strategy won all six of its games, and the remaining three split their matches. The fitnesses would then be $\{6, 2, 2, 2\}$, resulting in selection probabilities of $\{\frac{6}{12}, \frac{2}{12}, \frac{2}{12}, \frac{2}{12}\}$. Now we assign each potential parent a slice of the range $(0,1)$. [![](/images/2012/07/StrategySelection.png "StrategySelection")](/images/2012/07/StrategySelection.png)Strategy 1 gets the range $(0.\frac{6}{12})$, strategy 2 gets the range $[\frac{6}{12}, \frac{8}{12})$, strategy 3 gets the range $[\frac{8}{12}, \frac{10}{12})$, and strategy 4 gets the final slice, $[\frac{10}{12},1)$.

We need four parents, so we sample this distribution four times. Note that we could get the first strategy each time we sample, but we could also get strategy 3 for all four parents, illustrating why a pool size of four is generally a bad idea. Since playing the actual matches is the most time-consuming part of the process, the choice of pool size actually represents a trade-off between the time we're willing to spend letting the algorithm run and the variety of strategies we'd like to search. I chose a pool size of forty.

## Making Babies - Digitally
I'll describe the algorithm for creating child strategies from parents shortly, but first, I'm going to name the strategies for ease of reference. I'll call parent 1 Wes, parent 2 Mara, and the two child strategies will be named Miles and Sophie, who come about in the following way:

Miles gets the average of the weights of Wes and Mara. Sophie gets $S_{w}$ from Mara and $B_{w}$ and $O_{w}$ from Wes. As an example, suppose Wes and Mara have the weights below:

Wes: $\color{#FF0000}{\{\frac{5}{12}, \frac{1}{12}, \frac{11}{12}\}}$

Mara: $\color{#0000FF}{\{\frac{7}{12}, \frac{5}{12}, \frac{9}{12}\}}$

Then Miles looks like this:

$\color{#FF00FF}{S_{w} = \frac{\frac{5}{12} + \frac{7}{12}}{2} = \frac{6}{12} \newline B_{w}= \frac{\frac{1}{12} + \frac{5}{12}}{2} = \frac{3}{12} \newline O_{w} = \frac{\frac{11}{12} + \frac{9}{12}}{2} = \frac{10}{12}}$

Miles:  $\color{#FF00FF}{\{\frac{6}{12}, \frac{3}{12}, \frac{10}{12}\}}$

And Sophie gets:

Sophie: $\{$ $\color{#0000FF}{\frac{7}{12}}$ $,$ $\color{#FF0000}{\frac{1}{12}}$ $,$ $\color{#FF0000}{\frac{11}{12}}$ $\}$

This may seem a somewhat odd choice. I would agree, but since I'm not using a binary coding for the system, I didn't think a simple one-point crossover (where Miles would have simply gotten the values not assigned to Sophie) would provide enough variety. So, I chose this hybrid crossover/average method for creating children instead.

## Mutation
Each child then gets a chance for a slight variation in each of the three parameters. In my case, I chose to shift each parameter up or down by a random amount sampled from a normal distribution centered at zero with a standard deviation of $0.03$. Even though this usually leads to a small mutation, I have imposed an artificial bound of $[0,1]$ on each parameter, so if the mutation goes outside of that, I simply rein it back in.

After mutation, we now have a fresh pool of strategies to start all over again, but when will it end? I simply chose to run the algorithm for a static number of generations (75), keeping track of the most fit strategy (the one with the highest number of wins) over the course of the entire run. Each run took about three days, so I only did three of them.

## What Did My Computer Learn?
[![](/images/2012/07/aiBrain.jpg "aiBrain")](/images/2012/07/aiBrain.jpg)

The best strategies I found over the course of three runs were as follows:

1: $(0.581688, 0.442021, 0.282089)$

2: $(0.62384, 0.580063, 0.384694)$

3: $(0.650594, 0.575989, 0.382001)$

There are some similarities among all three, and very obviously among the last two. For instance, score is always weighted highest, just a little higher than balance of stones, and roughly twice as high as the overflow parameter. Since I could have appealed to intuition to tell me that score is the most important factor, these results make me reasonably confident that the algorithm found a good solution. While I had no prediction for the relative weights of the balance and overflow parameters, the results are at least not shocking. Controlling more stones is really quite important, though not quite so important as scoring, and overflow, while certainly bad, can't be expected to match the value of the other two parameters, and it clearly doesn't. In fact, based on the results, I might try an even simpler board valuation technique that only considers score and balance.

The real test, however, is how competitive the strategy is against a real human. The best strategy gave me a real challenge. It was several matches before I found a weakness, and several more before I was able to beat it, but even then I abused my knowledge of how it played to do so. The really fun part about using a GA is that I never told any of the strategies the object of the game. I merely asked them to value the state of the game in different ways, and then pitted them against each other to see whose valuations were best.

I've made the [code available](http://sourceforge.net/projects/owaremancala/), so if you're inclined, you can try it yourself. The project was built with VS 2008 as a C++ project. It's fairly shoddy code, but it works and it's fun! Enjoy.
