import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useNotification } from '../context/NotificationContext';

// This is a new component for the suggestion form.
const SuggestionBox = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  // Handles the form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation to ensure all fields are filled.
    if (!name || !mobile || !suggestion) {
      showNotification('Please fill in all fields.', 'error');
      return;
    }
    setLoading(true);
    try {
      // Adds the suggestion data to the 'suggestions' collection in Firestore.
      await addDoc(collection(db, 'suggestions'), {
        name,
        mobile,
        suggestion,
        createdAt: serverTimestamp(),
      });
      showNotification('Thank you for your suggestion!', 'success');
      // Clear form fields after successful submission.
      setName('');
      setMobile('');
      setSuggestion('');
    } catch (error) {
      console.error('Error adding document: ', error);
      showNotification('Failed to submit suggestion. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-gray-50 p-8 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Have a Suggestion?</h2>
          <p className="text-center text-gray-600 mb-8">
            Want a course we don't offer? Let us know what you'd like to learn!
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Name"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="mobile" className="block text-gray-700 font-semibold mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Mobile Number"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="suggestion" className="block text-gray-700 font-semibold mb-2">
                Suggestion
              </label>
              <textarea
                id="suggestion"
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us what course you'd like to see..."
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:bg-blue-300"
            >
              {loading ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuggestionBox;
