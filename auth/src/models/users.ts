import mongoose from 'mongoose';
import { Password } from './../services/password'
// an interface that describe the properties required to create a new user

interface UserAttrs {
    email: string;
    password: string
}

// an interface describes the properties that a user moedl has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}
// interface that describes the properties the user document has
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'))
        this.set('password', hashed);
    }
    next()
})
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
}


const User = mongoose.model<UserDoc, UserModel>('User', userSchema);



export { User };