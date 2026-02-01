import LoginForm from "../components/forms/LoginForm";
import "./LoginPage.css";

export default function LoginPage() {
    return (
        <div className="login-page">
            {/* Animated curved spotlight elements */}
            <svg className="animated-curves" viewBox="0 0 1200 800" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#7d6fd6', stopOpacity: 0.6}} />
                        <stop offset="50%" style={{stopColor: '#a298ef', stopOpacity: 0.4}} />
                        <stop offset="100%" style={{stopColor: '#d5d1ff', stopOpacity: 0.3}} />
                    </linearGradient>
                    <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#a298ef', stopOpacity: 0.5}} />
                        <stop offset="100%" style={{stopColor: '#7d6fd6', stopOpacity: 0.3}} />
                    </linearGradient>
                </defs>
                
                {/* Top right curve */}
                <path
                    d="M 900 0 Q 1000 100 1200 150"
                    className="curve curve-1"
                    stroke="url(#curveGradient)"
                />
                {/* Top right semicircle */}
                <circle cx="1100" cy="80" r="120" className="circle-outline circle-1" />
                
                {/* Middle right curve */}
                <path
                    d="M 1100 250 Q 1000 300 950 350"
                    className="curve curve-2"
                    stroke="url(#curveGradient)"
                />
                <circle cx="1050" cy="300" r="100" className="circle-outline circle-2" />
                
                {/* Bottom right curve */}
                <path
                    d="M 950 500 Q 1050 550 1200 650"
                    className="curve curve-3"
                    stroke="url(#curveGradient)"
                />
                <circle cx="1000" cy="700" r="110" className="circle-outline circle-3" />
                
                {/* Additional curves */}
                <path
                    d="M 1000 100 Q 1050 200 1100 300"
                    className="curve curve-4"
                    stroke="url(#curveGradient)"
                />
                <circle cx="900" cy="500" r="95" className="circle-outline circle-4" />
                
                <path
                    d="M 850 400 Q 950 450 1100 500"
                    className="curve curve-5"
                    stroke="url(#curveGradient)"
                />
            </svg>

            {/* Animated light circles */}
            <div className="light-circle circle-1"></div>
            <div className="light-circle circle-2"></div>
            <div className="light-circle circle-3"></div>
            <div className="light-circle circle-4"></div>
            <div className="light-circle circle-5"></div>

            {/* Content Container */}
            <div className="login-content">
                {/* Left Side - Brand & Tagline */}
                <div className="brand-content">
                    <div className="brand-section">
                        <div className="logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.8"/>
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h1 className="brand-name">TravelQuest</h1>
                    </div>
                    
                    <div className="tagline-section">
                        <h2 className="main-tagline">Embark on Your</h2>
                        <h2 className="main-tagline highlight">Next Adventure</h2>
                        <p className="tagline-description">
                            Discover unique itineraries, share your expertise as a guide,
                            or explore the world with those who know it best.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="form-content">
                    <div className="form-container">
                        <div className="form-header">
                            <h2 className="form-title">Welcome Back!</h2>
                            <p className="form-subtitle">Sign in to continue your journey</p>
                        </div>
                        <LoginForm />
                    </div>
                </div>
            </div>
        </div>
    );
}