---
title: "Classify Your Face – in a Web Browser!"
description: "A VGG16-based network that guesses gender from a photo with about 95% accuracy, now running in your browser. Plus what its mistakes reveal about the labels."
pubDate: 2020-05-11
tags: [machine-learning, computer-vision, deep-learning, project]
draft: false
legacy: true
cover: "/images/2020/05/classify-cover.jpg"
demo: /classify-your-face/
---

Note: This post was rescconstructed in 2026 from notes, logs, and artifacts from a prior entry on divergentblue.com, with some help from my buddy Claude.

<p><a class="try-it" href="/classify-your-face/">Try it: classify your own face →</a></p>

## From Averages to Predictions

In [What's the Average Face?](/blog/what-is-the-average-face/), I averaged the 202,599 photos in the [CelebA dataset](http://mmlab.ie.cuhk.edu.hk/projects/CelebA.html) into a single face that looks remarkably like a real person. The takeaway was that this set of images has a fairly consistent structure: every photo is cropped and aligned to the same 178×218 frame. So it's reasonable to expect a machine learning algorithm to pick up on that.

For my deep learning course project, I built a model to do exactly that: predict one of CelebA's 40 yes/no attributes from the photo alone. I wanted an attribute with a reasonably even split, which narrowed it to a few, such as "Attractive", "Male" and "Smiling". I picked "Male".

## Standing on VGG's Shoulders

Image classification was, until quite recently, a notoriously difficult problem, even for supercomputers. Convolutional neural networks changed that, to the point where it's solvable on a mid-range laptop with a mediocre video card.

The standard approach is to start with a pre-trained network as a fixed base, then add a few trainable layers on top. For a yes/no question, that means a pre-trained convolutional base, flattened, then a dense layer, then a single sigmoid output.

![The model: a VGG16 convolutional base, flattened, then dense layers converging to one sigmoid output](/images/2020/05/model_plot.png)

I tested VGG16, VGG19 and Inception v3 bases on a 1,000-image subset. VGG16 did best. Inception v3 showed some promise, but on the full dataset it performed poorly no matter how I tuned it. At nearly thirty minutes per epoch, even on a GPU, I decided it wasn't worth pursuing.

Training used a 60/20/20 train/validation/test split. With this much data, 60% is plenty for training. My first attempt randomly rotated, sheared, zoomed, shifted and flipped the training images. It produced the peculiar result that validation accuracy beat training accuracy from the very first epoch. Removing the augmentation, reshuffling and adding dropout didn't help. Slowing the learning rate to 5×10⁻⁶ (with momentum 0.9) finally gave a reasonable-looking model, which starts overfitting around epoch 4 or 5.

## How Well Does It Work?

Somewhat to my amazement, the VGG16 model reached close to **95% accuracy** on a held-out test set of about 40,000 images, with relatively few false positives in either direction.

Its mistakes are more interesting than its successes. The model leans heavily on hair length and hairstyle, so it struggles with children, and with faces that are partly covered or wearing hats.

Scanning the misses also turned up at least one image that was labeled wrong in the dataset itself, and it exposes an assumption baked into the labels: that every category is truly binary. Rachel Maddow is labeled "male" in CelebA. My model "misidentified" her as female. The label really seems to target gender rather than sex, and gender is a spectrum, not a binary attribute. Whoever labeled that image wasn't alone; even IBM's Watson [made the same mistake](https://towardsdatascience.com/ai-thinks-rachel-maddow-is-a-man-and-this-is-a-problem-for-all-of-us-921e45523d6e) with high confidence. The same point could be made about many of the attributes, especially "Attractive". Given all that, it's remarkable the model performs as well as it does.

## Now in Your Browser

A model sitting in a notebook isn't much fun, so I converted it to [TensorFlow.js](https://www.tensorflow.org/js), which runs it entirely in a web browser. Nothing is uploaded anywhere: your photo stays on your device, and your browser does the math.

**[Try it here](/classify-your-face/).** Upload a photo, use your camera, or try one of the CelebA samples. Because the model learned from tightly framed celebrity headshots, it works best when your face fills the guide the same way. The first run downloads about 72 MB of model weights, so give it a moment.

<!-- TODO: anything you remember about the original 2020 page, e.g. the "remember this face, caught in the wild" bit Liz mentioned. -->

## What's Next?

This model is far from fully tuned. I could add or resize layers, add convolutional layers, train the last few layers of VGG16 itself, or adjust the dropout and data split. But given the state of the art just ten years ago, it's absolutely amazing that a problem like this can be solved so accurately on a personal computer.

The code is on [GitLab](https://gitlab.com/dawdawdo/face).
