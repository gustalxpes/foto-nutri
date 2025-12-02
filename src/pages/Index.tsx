import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNutritionStore } from '@/store/nutritionStore';

const Index = () => {
  const navigate = useNavigate();
  const currentUser = useNutritionStore((state) => state.currentUser);

  useEffect(() => {
    // Redirect based on auth state
    if (currentUser) {
      navigate('/home', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  return null;
};

export default Index;
