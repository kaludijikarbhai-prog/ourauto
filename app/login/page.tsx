import LoginForm from '../components/Auth/LoginForm';

export const metadata = {
  title: 'Login - OurAuto',
  description: 'Login to OurAuto with your phone number',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">OurAuto</h1>
          <p className="text-lg text-gray-600">AI-Powered Vehicle Marketplace</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 text-sm mb-8">Enter your phone number to login</p>

          <LoginForm />

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              By logging in, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>
              {' and '}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
          <p className="font-semibold text-gray-900 mb-2">🔒 Secure Login</p>
          <ul className="space-y-1 text-xs">
            <li>✓ SMS OTP verification</li>
            <li>✓ No password required</li>
            <li>✓ Encrypted connection</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
