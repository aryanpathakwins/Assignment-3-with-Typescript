// src/components/users/UsersModal.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  Row,
  Col,
  Radio,
  Tooltip,
  Divider,
  Switch,
  Tag,
  Empty,
  Space,
  Badge,
  Typography,
} from "antd";
import {
  UploadOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";

// ---------- Types ----------
interface User {
  id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  profileImage?: string | null;
  isActive?: boolean;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  purchasedProducts?: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

// ---------- Component ----------
const { Title, Text } = Typography;

const UsersModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { users, loading, error, currentUser } = useSelector(
    (state: RootState) => state.user
  );

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    showSizeChanger: true,
    pageSizeOptions: [3, 5, 10, 20],
  });

  const [receiptUser, setReceiptUser] = useState<User | null>(null);
  const [receiptVisible, setReceiptVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) message.error("Failed to fetch users");
  }, [error]);

  useEffect(() => {
    if (!currentUser) {
      message.info("You have been logged out");
      navigate("/login", { replace: true });
    }
  }, [currentUser, navigate]);

  // ---------- Helpers ----------
  const fileToBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ---------- Actions ----------
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      message.success("User deleted successfully");
    } catch (err: any) {
      message.error(err.message || "Failed to delete user");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setProfileImage(user.profileImage || null);
    form.setFieldsValue(user);
  };

  const handleBeforeUpload = async (file: RcFile) => {
    if (file.size / 1024 / 1024 >= 5) {
      message.error("Image must be smaller than 5MB!");
      return Upload.LIST_IGNORE;
    }
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      message.error("Only JPG/PNG files allowed!");
      return Upload.LIST_IGNORE;
    }
    try {
      const base64 = await fileToBase64(file);
      setProfileImage(base64);
      message.success("Image uploaded!");
    } catch {
      message.error("Failed to upload image");
    }
    // prevent automatic upload; we store base64 locally
    return false;
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    const values = form.getFieldsValue();
    try {
      await dispatch(
        updateUser({ ...editingUser, ...values, profileImage })
      ).unwrap();
      message.success("Profile updated successfully");
      resetForm();
    } catch (err: any) {
      message.error("Failed to update profile: " + (err.message || err));
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await dispatch(
        updateUser({
          ...user,
          isActive: !user.isActive,
          purchased: undefined,
        })
      ).unwrap();
      message.success(
        `User ${!user.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (err: any) {
      message.error("Failed to update status: " + (err.message || err));
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setProfileImage(null);
    form.resetFields();
  };

  const handleRemovePurchasedProduct = async (productToRemove: {
    productId: any;
    productName: any;
    quantity: any;
    price?: number;
  }) => {
    if (!editingUser) return;

    let removeQty = 1;

    Modal.confirm({
      title: `Remove Quantity of ${productToRemove.productName}`,
      content: (
        <div>
          <p>Available to remove: {productToRemove.quantity}</p>
          <Input
            type="number"
            min={1}
            max={productToRemove.quantity}
            defaultValue={1}
            onChange={(e) => {
              removeQty = Number(e.target.value);
            }}
          />
        </div>
      ),
      okText: "Remove",
      cancelText: "Cancel",
      async onOk() {
        try {
          const res = await fetch(
            `http://localhost:3000/cards/${productToRemove.productId}`
          );
          if (res.ok) {
            const card = await res.json();
            const updatedCard = {
              ...card,
              quantity: card.quantity + removeQty,
            };
            await fetch(`http://localhost:3000/cards/${card.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedCard),
            });
          }

          // Update user purchase list
          const updatedProducts = (
            editingUser.purchasedProducts?.map((p) => {
              if (p.productId === productToRemove.productId) {
                if (p.quantity - removeQty <= 0) return null;
                return { ...p, quantity: p.quantity - removeQty };
              }
              return p;
            })?.filter((p): p is NonNullable<typeof p> => p !== null) || []
          );

          const updatedUser = {
            ...editingUser,
            purchasedProducts: updatedProducts,
          };

          setEditingUser(updatedUser);
          message.success(
            `Removed ${removeQty} ${removeQty > 1 ? "units" : "unit"} of ${
              productToRemove.productName
            }`
          );
        } catch (err) {
          console.error("Failed to restore product quantity:", err);
          message.error("Failed to update product stock.");
        }
      },
    });
  };

  // ---------- Data & Columns ----------
  const filteredUsers = useMemo(() => {
    const term = searchText.toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        user.fullName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phoneNumber?.toLowerCase().includes(term) ||
        user.gender?.toLowerCase().includes(term) ||
        user.address1?.toLowerCase().includes(term || "");
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? user.isActive
          : !user.isActive;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchText, statusFilter]);

  const columns: ColumnsType<User> = [
    {
      title: "Profile",
      dataIndex: "profileImage",
      key: "profile",
      render: (image) => (
        <Avatar src={image} icon={!image && <UserOutlined />} size={48} />
      ),
      width: 90,
      fixed: "left",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => <Text strong>{text}</Text>,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phoneNumber", key: "phoneNumber" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    {
      title: (
        <div className="flex items-center gap-1">
          Purchased
          <Tooltip title="Total items purchased (click row to view full receipt)">
            <InfoCircleOutlined style={{ color: "#888" }} />
          </Tooltip>
        </div>
      ),
      dataIndex: "purchasedProducts",
      key: "purchasedProducts",
      render: (purchasedProducts: any[]) => {
        if (!purchasedProducts || purchasedProducts.length === 0)
          return <span style={{ color: "#999" }}>—</span>;
        const totalQty = purchasedProducts.reduce(
          (s, p) => s + (p.quantity || 0),
          0
        );
        return (
          <Tag color="blue" icon={<ShoppingCartOutlined />}>
            {totalQty} items
          </Tag>
        );
      },
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<StopOutlined />}
        />
      ),
      align: "center",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex items-center gap-2 justify-center">
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              type="default"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record);
              }}
              className="no-row-click"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(record.id);
              }}
              className="no-row-click"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const onRowClick = (record: User) => ({
    onClick: (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest(".no-row-click")) return;
      setReceiptUser(record);
      setReceiptVisible(true);
    },
  });

  const computeReceiptTotals = (u?: User) => {
    if (!u || !u.purchasedProducts || u.purchasedProducts.length === 0)
      return { totalQty: 0, totalAmount: 0 };
    const totalQty = u.purchasedProducts.reduce(
      (s, p) => s + (p.quantity || 0),
      0
    );
    const totalAmount = u.purchasedProducts.reduce(
      (s, p) => s + (p.quantity || 0) * (p.price || 0),
      0
    );
    return { totalQty, totalAmount };
  };

  // ---------- Render ----------
  return (
    <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 max-w-8xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <Title level={3} className="!mb-0">
            👥 Users
          </Title>
          <Text type="secondary">Manage users, purchases and status</Text>
        </div>
      </div>

      <div className="flex justify-between mb-5 flex-wrap gap-3">
        <Input
          placeholder="Search by name, email, phone, or address..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 340 }}
          allowClear
        />
        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            options={[
              { label: "All Users", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Empty description="No users found" className="py-12" />
      ) : (
        <Table<User>
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          pagination={pagination}
          scroll={{ x: 1200 }}
          rowClassName={() => "cursor-pointer hover:bg-gray-50"}
          onRow={(record) => onRowClick(record)}
        />
      )}

      {/* ---------- Edit Modal ---------- */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <Avatar
              size={56}
              src={profileImage || editingUser?.profileImage || undefined}
              icon={!profileImage && !editingUser?.profileImage && <UserOutlined />}
            />
            <div>
              <div className="font-semibold">
                {editingUser?.fullName || "Edit Profile"}
              </div>
              <div className="text-xs text-gray-500">{editingUser?.email}</div>
            </div>
          </div>
        }
        open={!!editingUser}
        onCancel={resetForm}
        footer={null}
        width={900}
        centered
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-28 h-28 rounded-full bg-gray-100 overflow-hidden border border-gray-200 mb-2">
            {profileImage ? (
              <>
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setProfileImage(null)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-500"
                  title="Remove image"
                >
                  ✕
                </button>
              </>
            ) : editingUser?.profileImage ? (
              <img
                src={editingUser.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                <UserOutlined />
              </div>
            )}
          </div>

          <Upload
            beforeUpload={handleBeforeUpload}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Upload Photo</Button>
          </Upload>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Email" name="email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Phone Number" name="phoneNumber" rules={[{ required: true }]}>
            <Input maxLength={15} />
          </Form.Item>

          <Form.Item label="Gender" name="gender" initialValue="male">
            <Radio.Group>
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
              <Radio value="other">Other</Radio>
            </Radio.Group>
          </Form.Item>

          <Divider orientation="left">Address</Divider>

          <Form.Item label="Address Line 1" name="address1">
            <Input placeholder="House No, Street Name" />
          </Form.Item>
          <Form.Item label="Address Line 2" name="address2">
            <Input placeholder="Apartment, Landmark (optional)" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="City" name="city">
                <Input placeholder="City" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="State" name="state">
                <Select placeholder="Select state">
                  <Select.Option value="Maharashtra">Maharashtra</Select.Option>
                  <Select.Option value="Gujarat">Gujarat</Select.Option>
                  <Select.Option value="Karnataka">Karnataka</Select.Option>
                  <Select.Option value="Delhi">Delhi</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Zip Code" name="zip">
                <Input placeholder="400001" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Country" name="country">
            <Select placeholder="Select country">
              <Select.Option value="India">India</Select.Option>
              <Select.Option value="USA">USA</Select.Option>
              <Select.Option value="Canada">Canada</Select.Option>
              <Select.Option value="UK">UK</Select.Option>
            </Select>
          </Form.Item>

          {/* Purchased Products */}
          {editingUser?.purchasedProducts && editingUser.purchasedProducts.length > 0 && (
            <div
              style={{
                border: "1px solid #eee",
                padding: 12,
                borderRadius: 8,
                background: "#fafafa",
                marginBottom: 16,
                maxHeight: 220,
                overflowY: "auto",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Purchased Products</div>
                <div className="text-sm text-gray-500">
                  Total: {editingUser.purchasedProducts.reduce((s, p) => s + (p.quantity || 0), 0)}
                </div>
              </div>
              {editingUser.purchasedProducts.map((product) => (
                <div
                  key={product.productId}
                  className="flex justify-between items-center py-2 border-b border-gray-100"
                >
                  <div>
                    <div className="font-medium">{product.productName}</div>
                    <div className="text-xs text-gray-500">Qty: {product.quantity} • ₹{(product.price || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <Button
                      type="text"
                      danger
                      onClick={() => handleRemovePurchasedProduct(product)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button type="primary" onClick={handleUpdate} className="flex-1">
              Save
            </Button>
            <Button onClick={resetForm} className="flex-1">
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ---------- Receipt Modal ---------- */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <Avatar
              src={receiptUser?.profileImage || undefined}
              icon={!receiptUser?.profileImage && <UserOutlined />}
              size={56}
            />
            <div>
              <div className="font-semibold">{receiptUser?.fullName}</div>
              <div className="text-xs text-gray-500">{receiptUser?.email}</div>
              <div className="text-xs text-gray-500">{receiptUser?.phoneNumber}</div>
            </div>
          </div>
        }
        open={receiptVisible}
        onCancel={() => setReceiptVisible(false)}
        footer={null}
        width={720}
        centered
      >
        {receiptUser ? (
          <>
            <Divider>Customer Information</Divider>
            <div className="text-sm mb-4">
              <p><strong>Name:</strong> {receiptUser.fullName}</p>
              <p><strong>Email:</strong> {receiptUser.email}</p>
              <p><strong>Phone:</strong> {receiptUser.phoneNumber}</p>
              <p>
                <strong>Address:</strong>{" "}
                {[receiptUser.address1, receiptUser.address2, receiptUser.city, receiptUser.state, receiptUser.zip, receiptUser.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>

            <Divider>Purchased Products</Divider>
            {receiptUser.purchasedProducts?.length ? (
              <div className="space-y-2">
                {receiptUser.purchasedProducts.map((product) => (
                  <div
                    key={product.productId}
                    className="flex justify-between py-2 border-b border-gray-100 text-sm"
                  >
                    <div>
                      <strong>{product.productName}</strong>
                    </div>
                    <div>
                      {product.quantity} × ₹{(product.price || 0).toFixed(2)} = ₹
                      {(product.quantity * (product.price || 0)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No purchased products found.
              </div>
            )}

            <Divider />
            <div className="flex justify-between text-base font-semibold">
              <span>Total Items:</span>
              <span>{computeReceiptTotals(receiptUser).totalQty}</span>
            </div>
            <div className="flex justify-between text-base font-semibold mt-2">
              <span>Total Amount:</span>
              <span>₹{computeReceiptTotals(receiptUser).totalAmount}</span>
            </div>

            <Divider />
            <div className="text-center text-gray-600 text-sm mt-3">
              Thank you for your purchase!
              <div className="text-xs text-gray-400">This is an auto-generated receipt.</div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">No user data available.</div>
        )}
      </Modal>
    </div>
  );
};

export default UsersModal;
