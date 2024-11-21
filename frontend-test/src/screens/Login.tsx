const Login = () => {
    const handleLoginWithGoogle = ()=> {
        window.location.href = "http://localhost:8080/googleLogin";
    }

    return (
        <div className="login_form">
        {/* <!-- Login form container --> */}
        <form action="#">
            <h3>Log in with</h3>

            <div className="login_option">

            {/* <!-- Google button --> */}
            <div className="option">
                <a href="#" onClick={ handleLoginWithGoogle }>
                    <img src="/google.png" alt="Google" />
                    <span>Google</span>
                </a>
            </div>

            {/* <!-- Apple button --> */}
            <div className="option">
                <a href="#">
                    <img src="/apple.png" alt="Apple" />
                    <span>Apple</span>
                </a>
            </div>
            </div>

            {/* <!-- Login option separator --> */}
            <p className="separator">
                <span>or</span>
            </p>

            {/* <!-- Email input box --> */}
            <div className="input_box">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Enter email address" required />
            </div>

            {/* <!-- Paswwrod input box --> */}
            <div className="input_box">
                <div className="password_title">
                    <label htmlFor="password">Password</label>
                    <a href="#">Forgot Password?</a>
                </div>

                <input type="password" id="password" placeholder="Enter your password" required />
            </div>

            {/* <!-- Login button --> */}
            <button type="submit">Log In</button>

            <p className="sign_up">Don't have an account? <a href="#">Sign up</a></p>
        </form>
        </div>
    )
}

export default Login