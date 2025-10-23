import { useState, useEffect } from "react";
import { Form, Input, Button, message, Divider, Checkbox } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./Redux/store";
import { fetchUsers, loginUser } from "./Redux/useslice";
import { FacebookOutlined, GoogleOutlined, AppleFilled } from "@ant-design/icons";

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, loading } = useSelector((state: RootState) => state.user);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      navigate("/webpage");
    }
  }, [currentUser, navigate]);

  const onFinish = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      await dispatch(loginUser(values)).unwrap();
      message.success("Login successful");
      navigate("/webpage");
    } catch (err: any) {
      message.error(err.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Image Section */}
      <div className="hidden md:flex md:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=1200&q=80"
          alt="login visual"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      </div>

      {/* Right Login Form Section */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-6">
        <div className="w-full max-w-md px-8 py-10 bg-white rounded-xl shadow-lg md:shadow-none relative">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <img
              src="./logo1.jpg"
              alt="logo"
              className="w-40 mb-3"
            />
            <h2 className="text-2xl font-semibold text-gray-800">Log in as a Pro</h2>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col gap-3 mb-4">
            <Button icon={<FacebookOutlined />} block className="h-10 font-medium">
              Continue with Facebook
            </Button>
            <Button icon={<GoogleOutlined />} block className="h-10 font-medium">
              Continue with Google
            </Button>
            <Button icon={<AppleFilled />} block className="h-10 font-medium">
              Continue with Apple
            </Button>
          </div>

          <Divider className="text-gray-400">Or</Divider>

          {/* Login Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            className="text-left space-y-4"
          >
            <Form.Item
              label={<span className="text-gray-700 font-medium">Email</span>}
              name="email"
              rules={[{ required: true, type: "email", message: "Enter valid email" }]}
            >
              <Input
                placeholder="Enter your email"
                className="h-10 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium">Password</span>}
              name="password"
              rules={[{ required: true, message: "Enter password" }]}
            >
              <Input.Password
                placeholder="••••••••"
                maxLength={8}
                className="h-10 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </Form.Item>

            <div className="flex items-center justify-between mb-3 text-sm">
              <Checkbox>Remember Me</Checkbox>
              <a href="#" className="text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isSubmitting || loading}
                className="h-10 font-semibold rounded-md bg-blue-600 hover:bg-blue-700"
              >
                Log in with Email
              </Button>
            </Form.Item>

            <div className="text-center text-sm mt-3">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Sign Up
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
