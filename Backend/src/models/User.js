import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        select:false
    },
    bio:{
        type:String,
        default:""
    },
    profilePic:{
        type:String,
        default:""
    },
    nativeLanguage:{
        type:String,
        default:""
    },
    learningLanguage:{
        type:String,
        default:""
    },
    location:{
        type:String,
        default:""
    },
    isOnboarded:{
        type:Boolean,
        default:false
    },
    friends:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ]
} , {
    timestamps:true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    },
    toObject: {
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});

userSchema.index({ nativeLanguage: 1, learningLanguage: 1, isOnboarded: 1 });
userSchema.index({ isOnboarded: 1, _id: 1 });
userSchema.index({ fullName: "text", bio: "text", location: "text" });


//pre hook
userSchema.pre("save", async function(next){

    if(!this.isModified("password")) return next();
    
    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password , salt);

        next();
    } catch(error) {
        next(error);
    }
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
  return isPasswordCorrect;
};


const User = mongoose.model("User", userSchema);


export default User;