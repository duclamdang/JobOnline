import { useEffect, useState } from "react";
import logo24h from "../../assets/vieclam24h.png";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@context/hooks";
import { loginAdmin } from "@admin/store/redux/authSlice";
import { fetchProfile } from "@admin/store/redux/profileSlice"; // 👈 thêm fetchProfile

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@components/InputField";

const loginSchema = z.object({
  email: z.string().nonempty("Bạn chưa nhập email").email("Email không hợp lệ"),
  password: z
    .string()
    .nonempty("Bạn chưa nhập mật khẩu")
    .min(6, "Mật khẩu phải ít nhất 6 ký tự"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { i18n, t } = useTranslation();
  const [lang, setLang] = useState<"vi" | "en">("vi");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const { loading, error: authError } = useAppSelector((state) => state.auth);

  useEffect(() => {
    i18n.changeLanguage("vi");
  }, [i18n]);

  const toggleLang = () => {
    if (lang === "vi") {
      setLang("en");
      i18n.changeLanguage("en");
    } else {
      setLang("vi");
      i18n.changeLanguage("vi");
    }
  };

  // ✅ Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = (data: LoginFormValues) => {
    dispatch(loginAdmin(data))
      .unwrap()
      .then(() => {
        dispatch(fetchProfile()).then(() => {
          window.location.href = "/admin";
        });
      });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="flex justify-between items-center px-4 sm:px-6 py-3 shadow-sm bg-white">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={logo24h} alt="Vieclam24h" className="h-6 sm:h-8" />
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="/"
            className="flex items-center gap-1 sm:gap-2 hover:text-purple-700 transition"
          >
            <GroupsOutlinedIcon className="text-blue-500 text-sm sm:text-base" />
            <div className="flex flex-col leading-tight text-left">
              <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">
                {t("header.goTo")}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-800">
                {t("header.jobSeeker")}
              </span>
            </div>
          </a>

          {/* Flag toggle */}
          <button onClick={toggleLang} className="ml-1 sm:ml-2">
            {lang === "vi" ? (
              <img
                src="https://flagcdn.com/us.svg"
                alt="Switch to English"
                className="h-4 w-6 sm:h-5 sm:w-7 object-cover border"
              />
            ) : (
              <img
                src="https://flagcdn.com/vn.svg"
                alt="Chuyển sang Tiếng Việt"
                className="h-4 w-6 sm:h-5 sm:w-7 object-cover border"
              />
            )}
          </button>
        </div>
      </header>

      {/* Form login */}
      <main className="flex flex-1 justify-center items-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 ">
              {t("login.adminTitle")}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <InputField<LoginFormValues>
                name="email"
                control={control}
                label={t("login.email")}
                type="email"
                placeholder={t("login.enterEmail")}
                error={errors.email?.message}
              />

              {/* Password */}
              <div className="relative">
                <InputField<LoginFormValues>
                  name="password"
                  control={control}
                  label={t("login.password")}
                  type={showPassword ? "text" : "password"}
                  placeholder={t("login.enterPassword")}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-600 hover:text-purple-700"
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>

              {authError && (
                <p className="text-red-600 text-sm text-center">{authError}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
              >
                {loading ? t("login.signingIn") : t("login.signIn")}
              </button>

              <div className="text-center">
                <a href="#" className="text-sm text-purple-700 hover:underline">
                  {t("login.forgotPassword")}
                </a>
              </div>
            </form>
          </div>

          <div className="mt-3 bg-white shadow-md rounded-md p-4 text-center text-sm">
            {t("login.newEmployer")}{" "}
            <a
              href="/admin/register"
              className="text-purple-700 font-semibold underline"
            >
              {t("login.register")}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
