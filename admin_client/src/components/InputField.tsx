// Import Controller (kết nối input custom với form) và Control (type quản lý form state)
import { Controller, Control, FieldValues, Path } from "react-hook-form";

// ✅ Props cho InputField (dùng generic để tái sử dụng cho mọi form)
interface InputFieldProps<T extends FieldValues> {
  name: Path<T>; // Tên field (sẽ tự type-safe theo form)
  control: Control<T>; // State quản lý form từ react-hook-form
  label: string;
  type?: string; // Kiểu input (text, password, email...)
  placeholder?: string;
  error?: string;
}

// ✅ Component InputField tái sử dụng
export default function InputField<T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  placeholder,
  error,
}: InputFieldProps<T>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {/* Controller: "cầu nối" giữa react-hook-form và input */}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field} // Spread -> tự động gắn value, onChange, ref
            type={type}
            placeholder={placeholder}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#451DA0] 
              ${error ? "border-red-500" : "border-gray-300"}`} // Nếu có lỗi -> border đỏ
          />
        )}
      />

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
