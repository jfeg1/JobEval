import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/shared';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-50">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-light text-sage-900 mb-4">
          JobEval
        </h1>
        <p className="text-xl text-slate-600 mb-8">
          Open-source salary evaluation tool
        </p>
        <p className="text-slate-600 mb-8">
          Get personalized salary recommendations based on your position,
          experience, and market data.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/setup/company')}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};
