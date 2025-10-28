import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Radio,
  Checkbox,
  Divider,
  message,
} from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "./Redux/useslice";
import type { RootState, AppDispatch } from "./Redux/store";
import { FacebookOutlined, GoogleOutlined, } from "@ant-design/icons";

interface SignupFormValues {
  fullName: string;
  email: string | undefined;
  password: string;
  confirm_password: string;
  phoneNumber: string;
  gender: "male" | "female" | "other";
  terms: boolean;
}

export default function Signup() {
  const [form] = Form.useForm<SignupFormValues>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: SignupFormValues) => {
    setLoading(true);

    const emailExists = users.some(
      (u) =>
        typeof u.email === "string" &&
        typeof values.email === "string" &&
        u.email.toLowerCase() === values.email.toLowerCase()
    );
    if (emailExists) {
      message.error("Email already exists!");
      setLoading(false);
      return;
    }

    const { confirm_password, ...userData } = values;
    try {
      await dispatch(signupUser(userData)).unwrap();
      message.success("Account created successfully!");
      form.resetFields();
      navigate("/login");
    } catch (err) {
      if (err instanceof Error) {
        message.error("Signup failed: " + err.message);
      } else {
        message.error("Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Image Section */}
      <div className="hidden md:flex md:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=1200&q=80"
          alt="signup visual"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      </div>

      {/* Right Signup Form Section */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-6">
        <div className="w-full max-w-md px-8 py-10 bg-white rounded-xl shadow-lg md:shadow-none relative">
          {/* Header */}
          <div className="flex flex-col items-center mb-4">
            <img src="./logo1.jpg" className="w-12 h-12 mb-2" alt="Logo" />
            <h2 className="text-2xl font-semibold text-gray-800">Create Your Account</h2>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col gap-3 mb-4">
            <Button icon={<FacebookOutlined />} block className="h-10 font-medium">
              Continue with Facebook
            </Button>
            <Button icon={<GoogleOutlined />} block className="h-10 font-medium">
              Continue with Google
            </Button>
          </div>

          <Divider className="text-gray-400">Or</Divider>

          {/* Signup Form */}
          <Form<SignupFormValues>
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            className="text-left space-y-2.5"
          >
            <Form.Item
              name="fullName"
              label={<span className="text-gray-700 font-medium">Full Name</span>}
              rules={[{ required: true, message: "Full name is required" }]}
            >
              <Input placeholder="Aryan Pathak" className="h-10 rounded-md focus:ring-2 focus:ring-blue-500" />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="text-gray-700 font-medium">Email</span>}
              rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
            >
              <Input placeholder="example@mail.com" className="h-10 rounded-md focus:ring-2 focus:ring-blue-500" />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-gray-700 font-medium">Password</span>}
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input.Password
                maxLength={8}
                autoComplete="new-password"
                className="h-10 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label={<span className="text-gray-700 font-medium">Confirm Password</span>}
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password
                maxLength={8}
                autoComplete="new-password"
                className="h-10 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label={<span className="text-gray-700 font-medium">Phone Number</span>}
              rules={[
                { required: true, message: "Phone number is required" },
                { pattern: /^\d{10}$/, message: "Enter a valid 10-digit number" },
              ]}
            >
              <Input maxLength={10} placeholder="9876543210" className="h-10 rounded-md focus:ring-2 focus:ring-blue-500" />
            </Form.Item>

            <Form.Item name="gender" label={<span className="text-gray-700 font-medium">Gender</span>} initialValue="male">
              <Radio.Group className="flex gap-4">
                <Radio value="male">Male</Radio>
                <Radio value="female">Female</Radio>
                <Radio value="other">Other</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="terms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error("Accept terms")),
                },
              ]}
            >
              <Checkbox>I agree to Terms & Conditions</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="h-10 font-semibold rounded-md bg-blue-600 hover:bg-blue-700"
              >
                Create Account
              </Button>
            </Form.Item>

            <p className="text-center text-sm mt-3">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
}
