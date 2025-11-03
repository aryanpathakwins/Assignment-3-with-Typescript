import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Radio,
  Checkbox,
  Divider,
  message,
  Select,
  Row,
  Col,
} from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "./Redux/useslice";
import type { RootState, AppDispatch } from "./Redux/store";

const { Option } = Select;

interface SignupFormValues {
  fullName: string;
  email: string | undefined;
  password: string;
  confirm_password: string;
  phoneNumber: string;
  gender: "male" | "female" | "other";
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
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

    const { confirm_password, terms, ...userData } = values;
    try {
      await dispatch(signupUser({ ...userData, purchased: [] })).unwrap();
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Image Section - KEEP SAME IMAGE */}
      <div className="hidden md:flex md:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=1200&q=80"
          alt="signup visual"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/30" />
        {/* subtle decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-black/10 to-transparent" />
      </div>

      {/* Right Signup Form Section - Structure preserved */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-6 overflow-y-auto">
        <div className="w-full max-w-2xl px-8 py-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg relative border border-gray-100">
          {/* Header (structure & logo preserved) */}
          <div className="flex flex-col items-center mb-6">
            <img
              src="./logo1.jpg"
              className="w-12 h-12 mb-2 rounded-full object-cover shadow-sm"
              alt="Logo"
            />
            <h2 className="text-2xl font-semibold text-gray-900">
              Create Your Account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Secure sign up — manage your dashboard effortlessly.
            </p>
          </div>

          {/* Signup Form (same fields, same validations) */}
          <Form<SignupFormValues>
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            className="text-left space-y-2.5"
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="fullName"
                  label={<span className="text-gray-700 font-medium">Full Name</span>}
                  rules={[{ required: true, message: "Full name is required" }]}
                >
                  <Input
                    placeholder="Aryan Pathak"
                    className="rounded-md shadow-sm"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="phoneNumber"
                  label={<span className="text-gray-700 font-medium">Phone Number</span>}
                  rules={[
                    { required: true, message: "Phone number is required" },
                    { pattern: /^\d{10}$/, message: "Enter a valid 10-digit number" },
                  ]}
                >
                  <Input maxLength={10} placeholder="9876543210" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              label={<span className="text-gray-700 font-medium">Email</span>}
              rules={[
                { required: true, type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input placeholder="example@mail.com" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="password"
                  label={<span className="text-gray-700 font-medium">Password</span>}
                  rules={[{ required: true, message: "Password is required" }]}
                >
                  <Input.Password maxLength={8} autoComplete="new-password" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
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
                  <Input.Password maxLength={8} autoComplete="new-password" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="gender" label="Gender" initialValue="male">
              <Radio.Group className="flex gap-4">
                <Radio value="male">Male</Radio>
                <Radio value="female">Female</Radio>
                <Radio value="other">Other</Radio>
              </Radio.Group>
            </Form.Item>

            <Divider>Address Information</Divider>

            <Form.Item
              label="Address Line 1"
              name="address1"
              rules={[{ required: true, message: "Enter Address Line 1" }]}
            >
              <Input placeholder="House No, Street Name" />
            </Form.Item>

            <Form.Item label="Address Line 2" name="address2">
              <Input placeholder="Apartment, Landmark (optional)" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[{ required: true, message: "Enter City" }]}
                >
                  <Input placeholder="City" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={8}>
                <Form.Item
                  label="State"
                  name="state"
                  rules={[{ required: true, message: "Select State" }]}
                >
                  <Select placeholder="Select state">
                    <Option value="Maharashtra">Maharashtra</Option>
                    <Option value="Gujarat">Gujarat</Option>
                    <Option value="Karnataka">Karnataka</Option>
                    <Option value="Delhi">Delhi</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={8}>
                <Form.Item
                  label="Zip Code"
                  name="zip"
                  rules={[{ required: true, message: "Enter Zip Code" }]}
                >
                  <Input placeholder="400001" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Country"
              name="country"
              rules={[{ required: true, message: "Select Country" }]}
            >
              <Select placeholder="Select country">
                <Option value="India">India</Option>
                <Option value="USA">USA</Option>
                <Option value="Canada">Canada</Option>
                <Option value="UK">UK</Option>
              </Select>
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
                className="h-10 font-semibold rounded-md"
              >
                Create Account
              </Button>
            </Form.Item>

            <p className="text-center text-sm mt-3 text-gray-600">
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
