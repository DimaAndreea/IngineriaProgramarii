import LoginForm from "../components/forms/LoginForm";
import "./LoginPage.css";

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Welcome to TravelQuest!</h2>
        <p className="login-subtitle">Choose your role and enter your credentials.</p>

        <LoginForm />
      </div>
    </div>
  );
}
