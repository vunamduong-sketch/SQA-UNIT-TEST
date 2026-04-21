import React, { useEffect, useState } from "react";
import {
    Rate,
    Input,
    Button,
    Avatar,
    Empty,
    Modal,
    Popconfirm,
    Space,
    Pagination,
    Spin,
} from "antd";
import { SendOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { callFetchReview } from "config/api";
import { ServiceType } from "constants/serviceType";
import { useAppSelector } from "redux/hooks";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { callDeleteReview } from "config/api";
import { callUpdateReview } from "config/api";
import { callCreateReview } from "config/api";
import { getUserAvatar } from "utils/imageUrl";
import { useParams } from "react-router-dom";

export default function ReviewActivity({ activity }) {
    const { activityId } = useParams();
    const user = useAppSelector((state) => state.account.user);
    const [reviews, setReviews] = useState([]);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(null);
    const [loadingEdit, setLoadingEdit] = useState(null);
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
    });

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState("");

    const handleGetReviews = async () => {
        setLoadingReviews(true);
        const res = await callFetchReview(
            `current=${meta.current}&pageSize=${meta.pageSize}&service_type=${ServiceType.ACTIVITY}&service_ref_id=${activityId}`
        );
        setLoadingReviews(false);
        setMeta({
            ...meta,
            total: res.meta.totalItems,
            totalPages: res.meta.totalPages,
        });
        if (res.isSuccess) {
            setReviews(res.data);
        }
    };

    useEffect(() => {
        if (activityId) {
            handleGetReviews();
        }
    }, [activityId, meta.current, meta.pageSize]);

    const handleSubmitReview = async () => {
        if (!comment.trim() || rating === 0) {
            toast.error("Vui lòng điền đầy đủ thông tin và chọn số sao", {
                position: "bottom-right",
            });
            return;
        }
        setLoadingSubmit(true);
        const res = await callCreateReview({
            service_type: ServiceType.ACTIVITY,
            service_ref_id: activityId,
            rating,
            comment,
        });
        setLoadingSubmit(false);
        if (res.isSuccess) {
            handleGetReviews();
            handleReset();
        }
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setEditRating(review.rating);
        setEditComment(review.comment);
        setIsEditModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!editComment.trim() || editRating === 0) {
            alert("Vui lòng điền đầy đủ thông tin và chọn số sao");
            return;
        }
        setLoadingEdit(editingReview.id);
        const res = await callUpdateReview(editingReview.id, {
            ...editingReview,
            rating: editRating,
            comment: editComment,
        });
        setLoadingEdit(null);

        if (res.isSuccess) {
            await handleGetReviews();
            handleReset();
        }
    };

    const handleDeleteReview = async (id) => {
        setLoadingDelete(id);
        const res = await callDeleteReview(id);
        setLoadingDelete(null);

        if (res.isSuccess) {
            await handleGetReviews();
            handleReset();
        }
    };

    const handleReset = () => {
        setEditComment("");
        setEditRating(0);
        setComment("");
        setRating(0);
        setIsEditModalVisible(false);
        setEditingReview(null);
    };

    const onChangePagination = (pageNumber, pageSize) => {
        setMeta({
            ...meta,
            current: pageNumber,
            pageSize: pageSize,
        });
    };

    return (
        <div className="min-h-screen py-8">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Đánh giá hoạt động
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-blue-600">
                                {activity?.avg_star?.toFixed(1)}
                            </span>
                            <div>
                                <Rate
                                    disabled
                                    value={Math.round(activity?.avg_star)}
                                />
                                <p className="text-sm text-gray-600">
                                    Dựa trên {meta.total} đánh giá
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review Form */}
                {user?.id > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Chia sẻ trải nghiệm của bạn
                        </h2>

                        <div className="space-y-4">
                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Đánh giá{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <Rate
                                        value={rating}
                                        onChange={setRating}
                                        size="large"
                                        style={{ fontSize: 32 }}
                                    />
                                    <span className="text-sm text-gray-600">
                                        {rating > 0 && `${rating} sao`}
                                    </span>
                                </div>
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bình luận{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input.TextArea
                                    placeholder="Chia sẻ trải nghiệm của bạn về khách sạn..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    maxLength={500}
                                    showCount
                                    className="rounded-lg"
                                />
                            </div>
                        </div>
                        {/* Submit Button */}
                        <div className="flex justify-end mt-6">
                            <Button
                                type="primary"
                                size="large"
                                icon={<SendOutlined />}
                                onClick={handleSubmitReview}
                                loading={loadingSubmit}
                                className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                            >
                                Gửi đánh giá
                            </Button>
                        </div>
                    </div>
                )}

                {/* Reviews List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Tất cả đánh giá ({meta.total})
                    </h2>
                    <Spin spinning={loadingReviews} tip="Đang tải đánh giá...">
                        {reviews.length === 0 ? (
                            <Empty description="Chưa có đánh giá nào" />
                        ) : (
                            <div className="flex flex-col items-end">
                                <div className="space-y-6 w-full">
                                    {reviews.map((review, index) => (
                                        <div
                                            key={index}
                                            className="border-b border-gray-200 pb-6 last:border-b-0"
                                        >
                                            {/* Review Header */}
                                            <div className="flex items-start gap-4 mb-3">
                                                <Avatar
                                                    size="large"
                                                    src={getUserAvatar(
                                                        review?.user?.avatar
                                                    )}
                                                >
                                                    {review?.user?.first_name?.substring(
                                                        0,
                                                        1
                                                    )}
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-semibold text-gray-900">
                                                            {
                                                                review?.user
                                                                    ?.last_name
                                                            }{" "}
                                                            {
                                                                review?.user
                                                                    ?.first_name
                                                            }
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-500">
                                                                {dayjs(
                                                                    review.created_at
                                                                ).format(
                                                                    "YYYY-MM-DD HH:mm:ss"
                                                                )}
                                                            </span>
                                                            {user?.id ===
                                                                review?.user
                                                                    ?.id && (
                                                                <Space size="small">
                                                                    <Button
                                                                        type="text"
                                                                        size="small"
                                                                        icon={
                                                                            <EditOutlined />
                                                                        }
                                                                        loading={
                                                                            loadingEdit ===
                                                                            review.id
                                                                        }
                                                                        onClick={() =>
                                                                            handleEditReview(
                                                                                review
                                                                            )
                                                                        }
                                                                        className="text-blue-600 hover:text-blue-700"
                                                                    />
                                                                    <Popconfirm
                                                                        title="Xóa đánh giá"
                                                                        description="Bạn có chắc chắn muốn xóa đánh giá này?"
                                                                        onConfirm={() =>
                                                                            handleDeleteReview(
                                                                                review.id
                                                                            )
                                                                        }
                                                                        okText="Xóa"
                                                                        cancelText="Hủy"
                                                                    >
                                                                        <Button
                                                                            type="text"
                                                                            size="small"
                                                                            icon={
                                                                                <DeleteOutlined />
                                                                            }
                                                                            loading={
                                                                                loadingDelete ===
                                                                                review.id
                                                                            }
                                                                            className="text-red-600 hover:text-red-700"
                                                                        />
                                                                    </Popconfirm>
                                                                </Space>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Rate
                                                        disabled
                                                        value={review.rating}
                                                        size="small"
                                                    />
                                                </div>
                                            </div>

                                            {/* Review Comment */}
                                            <p className="text-gray-700 leading-relaxed ml-14">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <Pagination
                                    pageSize={meta.pageSize}
                                    showQuickJumper
                                    total={meta.total}
                                    onChange={onChangePagination}
                                />
                            </div>
                        )}
                    </Spin>
                </div>

                <Modal
                    title="Chỉnh sửa đánh giá"
                    open={isEditModalVisible}
                    onOk={handleSaveEdit}
                    onCancel={() => {
                        handleReset();
                    }}
                    okText="Lưu"
                    cancelText="Hủy"
                    confirmLoading={!!loadingEdit}
                >
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Đánh giá
                            </label>
                            <Rate
                                value={editRating}
                                onChange={setEditRating}
                                size="large"
                                style={{ fontSize: 32 }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bình luận
                            </label>
                            <Input.TextArea
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                className="mb-2"
                                rows={4}
                                maxLength={500}
                                showCount
                            />
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
