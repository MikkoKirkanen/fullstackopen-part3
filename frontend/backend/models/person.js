import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
});

const Person = mongoose.model('Person', personSchema);

personSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export default Person;
