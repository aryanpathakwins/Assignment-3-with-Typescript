import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
  message,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Select,
  Tooltip,
} from "antd";
import {
  UploadOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../Redux/store";
import { addCard, updateCard } from "../../Redux/cardSlice";
import type CardType from "../../types/CardTypes";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface CardFormProps {
  editingCard?: CardType | null;
  onClose: () => void;
}

const generateId = (): string =>
  `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const CardForm: React.FC<CardFormProps> = ({ editingCard, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [image, setImage] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");

  useEffect(() => {
    if (editingCard) {
      form.setFieldsValue({
        title: editingCard.title,
        description: editingCard.description,
        price: editingCard.price,
        quantity: editingCard.quantity,
        availabilityRange:
          editingCard.availabilityFrom && editingCard.availabilityTo
            ? [dayjs(editingCard.availabilityFrom), dayjs(editingCard.availabilityTo)]
            : null,
        address1: editingCard.address1,
        address2: editingCard.address2,
        city: editingCard.city,
        state: editingCard.state,
        zip: editingCard.zip,
        country: editingCard.country,
      });
      setImage(editingCard.image || "");
    } else {
      form.resetFields();
      setImage("");
      setImageName("");
    }
  }, [editingCard, form]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleSubmit = (values: any) => {
    const {
      title,
      description,
      price,
      quantity,
      availabilityRange,
      address1,
      address2,
      city,
      state,
      zip,
      country,
    } = values;

    if (!title.trim()) {
      message.error("Title is required!");
      return;
    }

    const newCard: CardType = {
      id: editingCard ? editingCard.id : generateId(),
      title,
      description,
      price,
      quantity,
      availabilityFrom: availabilityRange
        ? availabilityRange[0].toISOString()
        : undefined,
      availabilityTo: availabilityRange
        ? availabilityRange[1].toISOString()
        : undefined,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      image,
      postalCode: "",
    };

    if (editingCard) {
      dispatch(updateCard(newCard));
      message.success("Product updated successfully!");
    } else {
      dispatch(addCard(newCard));
      message.success("Product added successfully!");
    }

    onClose();
  };

  const handleRemoveImage = () => {
    setImage("");
    setImageName("");
    message.info("Image removed");
  };

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      centered
      width="85%"
      className="no-scroll-modal"
      title={
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">
            {editingCard ? "✏️ Edit Product" : "🆕 Add New Product"}
          </h2>
        </div>
      }
      bodyStyle={{
        padding: "1.5rem 2rem",
        background:
          "linear-gradient(135deg, rgba(240,245,255,0.8) 0%, rgba(255,255,255,1) 100%)",
        borderRadius: "16px",
        maxHeight: "90vh",
        overflow: "hidden",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-full"
      >
        {/* Left Section */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
            <Form.Item label="Product Image" className="w-full">
              {image ? (
                <div className="relative w-32 h-32 mx-auto mb-3 group">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl border shadow-sm group-hover:scale-105 transition-transform duration-300"
                  />
                  <CloseCircleOutlined
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full text-lg cursor-pointer hover:scale-110 transition-transform"
                  />
                </div>
              ) : (
                <Upload
                  beforeUpload={handleImageUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button
                    icon={<UploadOutlined />}
                    className="rounded-lg bg-blue-50 hover:bg-blue-500 hover:text-white transition-all duration-300"
                  >
                    Upload Image
                  </Button>
                </Upload>
              )}
              {imageName && (
                <p className="text-gray-500 mt-2 text-sm">{imageName}</p>
              )}
            </Form.Item>
          </div>

          {/* Description */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
            <Form.Item
              label={
                <span className="flex items-center gap-1 text-gray-700 font-medium">
                  Description
                  <Tooltip title="Give a short but catchy product description.">
                    <InfoCircleOutlined />
                  </Tooltip>
                </span>
              }
              name="description"
            >
              <Input.TextArea
                rows={5}
                placeholder="Write a short product description..."
                className="rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
            </Form.Item>
          </div>
        </div>

        {/* Right Section */}
        <div className="space-y-6">
          {/* Product Details */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">
              🛍️ Product Details
            </h3>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Product Title"
                  name="title"
                  rules={[{ required: true, message: "Please enter product title!" }]}
                >
                  <Input
                    placeholder="Enter product title"
                    className="rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Price ($)"
                  name="price"
                  rules={[{ required: true, message: "Enter price!" }]}
                >
                  <InputNumber
                    className="w-full rounded-lg"
                    min={0}
                    placeholder="Price"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Quantity"
                  name="quantity"
                  rules={[{ required: true, message: "Enter quantity!" }]}
                >
                  <InputNumber
                    className="w-full rounded-lg"
                    min={1}
                    placeholder="Quantity"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Availability"
                  name="availabilityRange"
                  rules={[{ required: true, message: "Select availability!" }]}
                >
                  <RangePicker
                    className="w-full rounded-lg"
                    suffixIcon={<CalendarOutlined />}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Address */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">
              📍 Address
            </h3>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Address Line 1"
                  name="address1"
                  rules={[{ required: true, message: "Enter Address Line 1" }]}
                >
                  <Input placeholder="House No, Street" className="rounded-lg" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Address Line 2" name="address2">
                  <Input placeholder="Landmark (optional)" className="rounded-lg" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[{ required: true, message: "Enter City" }]}
                >
                  <Input placeholder="City" className="rounded-lg" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="State"
                  name="state"
                  rules={[{ required: true, message: "Select State" }]}
                >
                  <Select placeholder="Select state" className="rounded-lg">
                    <Option value="Maharashtra">Maharashtra</Option>
                    <Option value="Gujarat">Gujarat</Option>
                    <Option value="Karnataka">Karnataka</Option>
                    <Option value="Delhi">Delhi</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Postal Code"
                  name="zip"
                  rules={[{ required: true, message: "Enter Zip" }]}
                >
                  <Input placeholder="e.g. 400001" className="rounded-lg" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Country"
              name="country"
              rules={[{ required: true, message: "Select Country" }]}
            >
              <Select placeholder="Select country" className="rounded-lg">
                <Option value="India">India</Option>
                <Option value="USA">USA</Option>
                <Option value="Canada">Canada</Option>
                <Option value="UK">UK</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={onClose}
              className="h-10 rounded-lg border-gray-300 hover:bg-gray-100 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 font-semibold transition-all duration-300 shadow-md"
            >
              {editingCard ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default CardForm;
