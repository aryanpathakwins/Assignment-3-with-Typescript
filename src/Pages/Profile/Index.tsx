import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUser, logout } from "../../Redux/useslice";
import type { RcFile } from "antd/es/upload";
import type { RootState, AppDispatch } from "../../Redux/store";

const Index: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      message.error("No user logged in");
      navigate("/login");
      return;
    }
    form.setFieldsValue(currentUser);
    setProfileImage(currentUser.profileImage || null);
  }, [currentUser, form, navigate]);

  // Convert file to base64
  const getBase64 = (file: RcFile): Promise<string | null> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });

  const handleBeforeUpload = async (file: RcFile) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
      return Upload.LIST_IGNORE;
    }

    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg";

    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG files!");
      return Upload.LIST_IGNORE;
    }

    try {
      const base64 = await getBase64(file);
      setProfileImage(base64);
      message.success("Image uploaded successfully!");
    } catch {
      message.error("Failed to upload image");
    }

    return false;
  };

  const handleUpdate = async () => {
    if (!currentUser) return;
    const values = form.getFieldsValue();
    try {
      await dispatch(
        updateUser({ ...currentUser, ...values, profileImage: profileImage || null })
      ).unwrap();
      message.success("Profile updated successfully");
    } catch (err: any) {
      message.error("Failed to update profile: " + err.message);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50 px-4 py-8">
      <div className="bg-white/50 backdrop-blur-md rounded-2xl shadow-xl p-6 w-full max-w-lg sm:max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900">
          Edit Profile
        </h2>

        {/* Profile Image */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                  <div className="text-4xl text-gray-400">👤</div>
                </div>
              )}
            </div>
            <div className="absolute bottom-2 right-2">
              <Upload
                beforeUpload={handleBeforeUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  type="primary"
                  shape="circle"
                  icon={<UploadOutlined />}
                  size="small"
                  className="shadow-md"
                />
              </Upload>
            </div>
          </div>
        </div>

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          className="space-y-4 sm:space-y-6 text-sm sm:text-base"
        >
          <Form.Item label="Full Name" name="fullName">
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input placeholder="example@mail.com" />
          </Form.Item>

          <Form.Item label="Phone Number" name="phoneNumber">
            <Input maxLength={10} placeholder="9876543210" />
          </Form.Item>

          <Form.Item label="Gender" name="gender">
            <Select placeholder="Select Gender">
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="primary"
              onClick={handleUpdate}
              className="flex-1"
              block
            >
              Update
            </Button>
            <Button onClick={handleCancel} className="flex-1" block>
              Cancel
            </Button>
            <Button danger onClick={handleLogout} className="flex-1" block>
              Logout
            </Button>
          </div>
        </Form>
      </div>
    </main>
  );
};

export default Index;
