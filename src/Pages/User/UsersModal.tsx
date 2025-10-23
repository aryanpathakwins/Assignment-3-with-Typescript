import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../Redux/store";
import { fetchUsers, updateUser, deleteUser } from "../../Redux/useslice";
import {
  Button,
  Input,
  Select,
  Upload,
  message,
  Table,
  Avatar,
  Spin,
  Modal,
  Form,
} from "antd";
import { UploadOutlined, SearchOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";

interface User {
  id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  profileImage?: string | null;
}

const UsersModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector(
    (state: RootState) => state.user
  );

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [form] = Form.useForm();

  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    showSizeChanger: true,
    pageSizeOptions: [1, 3, 5, 10, 20],
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) message.error("Failed to fetch users");
  }, [error]);

  const handleDelete = (id: string) => {
    dispatch(deleteUser(id))
      .unwrap()
      .then(() => message.success("User deleted successfully"))
      .catch((err: Error) => message.error(err.message));
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setProfileImage(user.profileImage || null);
  };

  // ✅ Same reliable image upload logic as Profile page
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

    return false; // prevents auto-upload
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    const values = form.getFieldsValue();
    try {
      await dispatch(
        updateUser({ ...editingUser, ...values, profileImage })
      ).unwrap();
      message.success("Profile updated successfully");
      setEditingUser(null);
    } catch (err: any) {
      message.error("Failed to update profile: " + err.message);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user: User) => {
      const term = searchText.toLowerCase();
      return (
        user.fullName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phoneNumber?.toLowerCase().includes(term) ||
        user.gender?.toLowerCase().includes(term)
      );
    });
  }, [users, searchText]);

  const columns: ColumnsType<User> = [
    {
      title: "Profile",
      dataIndex: "profileImage",
      key: "profile",
      render: (image) => <Avatar src={image} icon={!image && "👤"} size={48} />,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => (a.fullName || "").localeCompare(b.fullName || ""),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => (a.email || "").localeCompare(b.email || ""),
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: (a, b) => (a.phoneNumber || "").localeCompare(b.phoneNumber || ""),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      sorter: (a, b) => (a.gender || "").localeCompare(b.gender || ""),
      render: (gender: string) =>
        gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="relative bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">All Users</h1>

      <div className="flex justify-end mb-4">
        <Input
          placeholder="Search by name, email, or phone..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
          className="w-80"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <Table<User>
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          pagination={{
            ...pagination,
            total: filteredUsers.length,
            onChange: (page, pageSize) =>
              setPagination({ current: page, pageSize }),
          }}
        />
      )}

      {/* ✅ Edit Modal */}
      <Modal
        title="Edit Profile"
        open={!!editingUser}
        onCancel={() => setEditingUser(null)}
        footer={null}
        width={600}
      >
        <div className="flex flex-col items-center mb-4">
          <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden border border-gray-300 mb-2">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                👤
              </div>
            )}
          </div>
          <Upload
            beforeUpload={handleBeforeUpload}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </div>

        <Form form={form} layout="vertical" className="space-y-4">
          <Form.Item label="Full Name" name="fullName">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
          <Form.Item label="Phone Number" name="phoneNumber">
            <Input maxLength={10} />
          </Form.Item>
          <Form.Item label="Gender" name="gender">
            <Select>
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>
          <div className="flex gap-2">
            <Button type="primary" onClick={handleUpdate} className="flex-1">
              Save
            </Button>
            <Button onClick={() => setEditingUser(null)} className="flex-1">
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersModal;
