// ODM (Object data Modelling) Library create a connection b/w MongoDB and Node.js JS Runtime env 
import mongoose from 'mongoose'

// function always returns a Promise/Callback hell and make error handling handling easy with try and catch
// async code (like API calls, database queries,or file operations) much easier
// help avoid "callback hell" and make async code look more like sync code
// {async} means run tasks in the background
const connectDB = async () => {
  // {await} pauses the execution of func until a promise is resolved
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
