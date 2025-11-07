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

  // ✅ Support up to 4 images
  const [images, setImages] = useState<string[]>(["", "", "", ""]);

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
      setImages(editingCard.images?.length ? editingCard.images : [editingCard.image || "", "", "", ""]);
    } else {
      form.resetFields();
      setImages(["", "", "", ""]);
    }
  }, [editingCard, form]);

  // ✅ Handle upload per image slot
  const handleImageUpload = (file: File, index: number) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImages = [...images];
      newImages[index] = reader.result as string;
      setImages(newImages);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = "";
    setImages(newImages);
    message.info(`Image ${index + 1} removed`);
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

    const filteredImages = images.filter(Boolean); // Remove empty slots

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
      image: filteredImages[0] || "", // Keep for backward support
      images: filteredImages, // ✅ full array of images
      postalCode: "",
      stock: 0,
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
          {/* ✅ Multiple Image Upload */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
            <Form.Item label="Product Images (up to 4)" className="w-full">
              <div className="grid grid-cols-2 gap-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center h-40"
                  >
                    {img ? (
                      <>
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-28 object-cover rounded-md"
                        />
                        <CloseCircleOutlined
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 text-red-500 bg-white rounded-full text-lg cursor-pointer hover:scale-110 transition-transform"
                        />
                      </>
                    ) : (
                      <Upload
                        beforeUpload={(file) => handleImageUpload(file, index)}
                        showUploadList={false}
                        accept="image/*"
                      >
                        <Button
                          icon={<UploadOutlined />}
                          className="rounded-lg bg-blue-50 hover:bg-blue-500 hover:text-white transition-all duration-300"
                        >
                          Upload {index + 1}
                        </Button>
                      </Upload>
                    )}
                  </div>
                ))}
              </div>
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

        {/* Right Section (same as before) */}
        <div className="space-y-6">
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
                  <InputNumber className="w-full rounded-lg" min={0} placeholder="Price" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Quantity"
                  name="quantity"
                  rules={[{ required: true, message: "Enter quantity!" }]}
                >
                  <InputNumber className="w-full rounded-lg" min={1} placeholder="Quantity" />
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

          {/* Address Section */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">📍 Address</h3>
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
