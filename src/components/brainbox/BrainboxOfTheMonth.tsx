import React, { useState, useEffect } from 'react';
import { getBrainboxOfTheMonth } from '../../services/brainboxService';
import { useAuth } from '../../contexts/AuthContext';

interface Brainbox {
  id: string;
  name: string;
  points: number;
  achievements: string[];
  avatar: string;
}

const BrainboxOfTheMonth: React.FC = () => {
  const { user } = useAuth();
  const [brainbox, setBrainbox] = useState<Brainbox | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrainbox = async () => {
      try {
        setIsLoading(true);
        const monthlyBrainbox = await getBrainboxOfTheMonth();
        setBrainbox(monthlyBrainbox);
      } catch (err) {
        setError('Failed to load Brainbox of the Month. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrainbox();
  }, []);

  if (isLoading) {
    return <div>Loading Brainbox of the Month...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!brainbox) {
    return <div>No Brainbox of the Month selected yet.</div>;
  }

  return (
    <div className="brainbox-of-the-month">
      <h2>Brainbox of the Month</h2>
      
      <div className="brainbox-profile">
        <img
          src={brainbox.avatar}
          alt={`${brainbox.name}'s avatar`}
          className="brainbox-avatar"
        />
        
        <div className="brainbox-details">
          <h3>{brainbox.name}</h3>
          <p className="points">Total Points: {brainbox.points}</p>
          
          <div className="achievements">
            <h4>Achievements</h4>
            <ul>
              {brainbox.achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainboxOfTheMonth; 