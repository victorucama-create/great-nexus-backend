const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CounterSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  seq: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

CounterSchema.pre('save', function(next){ this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Counter', CounterSchema);
