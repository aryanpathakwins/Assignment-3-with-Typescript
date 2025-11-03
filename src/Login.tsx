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
    if (currentUser) navigate("/webpage");
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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">
      {/* Left Image Section */}
      <div className="hidden md:flex md:w-1/2 relative group">
        <img
          src="https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=1200&q=80"
          alt="login visual"
          className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 " />
        <div className="absolute bottom-10 left-10 text-white">
          {/* <h2 className="text-3xl font-semibold drop-shadow-lg">Welcome Back!</h2>
          <p className="text-sm opacity-90 mt-2 max-w-xs">
            Streamline your workflow and stay connected to your projects with ease.
          </p> */}
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-6">
        <div className="w-full max-w-md px-8 py-10 rounded-2xl shadow-xl bg-white/80 backdrop-blur-md border border-gray-200 transition-transform duration-500 hover:shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <img src="./logo1.jpg" alt="logo" className="w-36 mb-4 drop-shadow-md" />
            <h2 className="text-3xl font-semibold text-gray-800">Log in as a Pro</h2>
            <p className="text-gray-500 text-sm mt-1">Access your professional dashboard</p>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col gap-3 mb-4">
            <Button
              icon={<FacebookOutlined />}
              block
              className="h-10 font-medium border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
            >
              Continue with Facebook
            </Button>
            <Button
              icon={<GoogleOutlined />}
              block
              className="h-10 font-medium border-gray-200 hover:border-red-500 hover:text-red-500 transition-all duration-300"
            >
              Continue with Google
            </Button>
            <Button
              icon={<AppleFilled />}
              block
              className="h-10 font-medium border-gray-200 hover:border-black hover:text-black transition-all duration-300"
            >
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
                className="h-11 rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
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
                className="h-11 rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
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
                className="h-11 font-semibold rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
              >
                Log in with Email
              </Button>
            </Form.Item>

            <div className="text-center text-sm mt-3 text-gray-600">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline font-medium">
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
