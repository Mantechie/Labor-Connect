import Review from '../models/Review.js'
import User from '../models/User.js'

// @desc    Post a review for a laborer
// @route   POST /api/reviews/
export const postReview = async (req, res) => {
  try {
    const { laborerId, userId, rating, comment, media } = req.body

    const newReview = new Review({
      laborer: laborerId,
      user: userId,
      rating,
      comment,
      media,
      isVerified: false, // Default to false, admin can verify later
    })

    const savedReview = await newReview.save()
    res.status(201).json({ message: 'Review submitted, pending verification', review: savedReview })
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit review', error: err.message })
  }
}

// @desc    Get all verified reviews for a laborer
// @route   GET /api/reviews/laborer/:id
export const getReviewsForLaborer = async (req, res) => {
  try {
    const laborerId = req.params.id

    const reviews = await Review.find({ laborer: laborerId, isVerified: true })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json(reviews)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message })
  }
}

// @desc    Admin verifies a review
// @route   PUT /api/reviews/verify/:id
export const verifyReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ message: 'Review not found' })

    review.isVerified = true
    await review.save()

    res.status(200).json({ message: 'Review verified successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify review', error: err.message })
  }
}

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Review not found' })

    res.status(200).json({ message: 'Review deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review', error: err.message })
  }
}
