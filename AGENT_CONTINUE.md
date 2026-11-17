Change the info modal for Distance to Goal to just say "This is the total sum of the dice needed to get all your checkers home."

And add another metric: given that a statistically average roll is 7, the minimum roll is 3 (because 2 1s is doubled to 4) and the maximum roll is 24 (double 6s), provide a max, avg, and min number of rolls needed to win. Format them `00.00 / 00.00 / 00.00`. If there are any other meaningful measures or scores that can be derived easily from this data, suggest it.

Replace the "to move" text with a star emoji about the same font size as the DTG number.

When done, tell me how you would approach building the NHPs given the following requirements. 
* I want there to be 4 levels of difficulty: beginner, intermediate, advanced, expert. 
* Beginners should be a little bit better than random moves, but not much. They should generally try to not leave themselves open, but not always pick the optimal piece to leave vulnerable. And they should "not see" the more advanced Delta moves all the time.
* Experts should choose the optimal move most of the time, but will sometimes miss a delta or not select the optimal piece(s) to move or leave open.
* intermediate and advanced should fall between beginner and expert, with roughly the same difference in skill from each other from one to the next.
