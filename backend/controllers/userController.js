import User from '../models/User.js'

// @desc    Get user by ID
// @route   GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc    Update user profile
// @route   PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { name, availability, specialization, socialLinks, description } = req.body

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name,
          availability,
          specialization,
          socialLinks,
          description,
        },
      },
      { new: true }
    ).select('-password')

    if (!updatedUser) return res.status(404).json({ message: 'User not found' })

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc    Get all laborers (for discovery)
// @route   GET /api/laborers
export const getAllLaborers = async (req, res) => {
  try {
    const laborers = await User.find({ role: 'laborer' }).select('-password')
    res.status(200).json(laborers)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
