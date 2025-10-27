import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../Redux/store";
import { addCard, updateCard } from "../../Redux/cardSlice";
import type CardType from "../../types/CardTypes";

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
      });
      setImage(editingCard.image || "");
      setImageName("");
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
    const { title, description } = values;
    if (!title.trim()) {
      message.error("Title is required!");
      return;
    }

    const newCard: CardType = {
      id: editingCard ? editingCard.id : generateId(),
      title,
      description,
      image,
    };

    if (editingCard) {
      dispatch(updateCard(newCard));
      message.success("Card updated successfully!");
    } else {
      dispatch(addCard(newCard));
      message.success("Card added successfully!");
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
      title={
        <span className="text-base sm:text-lg font-semibold">
          {editingCard ? "Edit Card" : "Add New Card"}
        </span>
      }
      className="!max-w-[95%] sm:!max-w-md"
      bodyStyle={{ padding: "1rem 1.25rem" }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-3"
      >
        {/* Title */}
        <Form.Item
          label={<span className="text-sm sm:text-base">Title</span>}
          name="title"
          rules={[{ required: true, message: "Please enter a title!" }]}
        >
          <Input placeholder="Enter card title" className="text-sm sm:text-base" />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label={<span className="text-sm sm:text-base">Description</span>}
          name="description"
        >
          <Input.TextArea
            rows={3}
            placeholder="Enter description (optional)"
            className="text-sm sm:text-base"
          />
        </Form.Item>

        {/* Image Upload */}
        <Form.Item label={<span className="text-sm sm:text-base">Upload Image</span>}>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Upload
              beforeUpload={handleImageUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button
                icon={<UploadOutlined />}
                className="text-sm sm:text-base"
              >
                Choose Image
              </Button>
            </Upload>

            {imageName && (
              <span
                title={imageName}
                className="text-gray-600 text-xs sm:text-sm max-w-[160px] truncate"
              >
                {imageName}
              </span>
            )}
          </div>

          {/* Image Preview */}
          {image && (
            <div className="relative mt-3">
              <img
                src={image}
                alt="Preview"
                className="w-full h-40 object-cover rounded-md border border-gray-300"
              />
              <CloseCircleOutlined
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 text-red-500 bg-white rounded-full text-lg cursor-pointer hover:text-red-600 transition"
              />
            </div>
          )}
        </Form.Item>

        {/* Buttons */}
        <Form.Item>
          <div className="flex justify-end gap-2 sm:gap-3">
            <Button onClick={onClose} className="text-sm sm:text-base">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="text-sm sm:text-base">
              {editingCard ? "Update" : "Add"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CardForm;
