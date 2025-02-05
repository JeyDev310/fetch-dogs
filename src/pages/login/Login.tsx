import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Spin } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from "../../context/AuthContext";
import UserT from "../../types/user";
import { postLogin } from "../../services/user";
import logoImg from "../../assets/imgs/logo.svg";

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserT>({
        name: '',
        email: ''
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * Handler for Input Change
     * @param e 
     * @param fieldName 
     */
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: string
    ) => {
        const { value } = e.target;

        setUser((prevState: UserT) => ({
            ...prevState,
            [fieldName]: value
        }));
    };

    /**
     * Login Function
     */
    const handleLogin = () => {
        login();
        navigate("/search"); // Redirect after login
    };

    /**
     * Sumit Login Function
     * @returns void
     */
    const submitLogin = () => {
        if (!user)
            return;

        setIsLoading(true);

        postLogin(user)
            .then(() => {
                setIsLoading(false);
                handleLogin();
            })
            .catch((error) => {
                setIsLoading(false);
                console.log(error);
            });
    }

    return (
        <div className="login-page">
            <Form
                id="login-form"
                name="login-form"
                className="login-form"
                onFinish={submitLogin}
            >
                <img className="login-logo" src={logoImg} alt="logo" />
                <br />
                <br />
                <br />
                <Form.Item
                    name="username"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Username!',
                        },
                    ]}
                >
                    <Input 
                        name="username"
                        prefix={<UserOutlined className="site-form-item-icon" />} 
                        placeholder="Username"
                        autoComplete="off"
                        onChange={(e) => handleInputChange(e, "name")}
                    />
                </Form.Item>
                <Form.Item
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your E-mail!',
                        },
                        { 
                            type: "email", 
                            message: "The input is not a valid email!" 
                        },
                    ]}
                >
                    <Input
                        name="email"
                        prefix={<MailOutlined className="site-form-item-icon" />} 
                        placeholder="E-mail"
                        autoComplete="off"
                        onChange={(e) => handleInputChange(e, "email")}
                    />
                </Form.Item>
                <br />
                <Button type="primary" htmlType="submit" size="large" variant="filled">
                    Log in
                </Button>
            </Form>
            {isLoading && <Spin className="loadingSpin" size="large" />}
        </div>
    )
}

export default Login