import { useEffect, useState } from "react";
import logo24h from "../../assets/vieclam24h.png";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@context/hooks";
import { loginAdmin } from "@admin/store/redux/authSlice";
import { fetchProfile } from "@admin/store/redux/profileSlice";

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-slate-900 to-slate-900">
      {/* HEADER */}
      <header className="flex justify-between items-center px-4 sm:px-8 py-3 border-b border-white/10 bg-slate-900/70 backdrop-blur">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={logo24h} alt="Vieclam24h" className="h-7 sm:h-9" />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs uppercase tracking-[0.15em] text-purple-200">
              JobOnline Admin
            </span>
            <span className="text-xs text-slate-300">
              {t("login.adminTitle")}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleLang}
          className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-white/10 transition"
        >
          <span className="uppercase">{lang}</span>
        </button>
      </header>

      {/* MAIN */}
      <main className="flex flex-1 items-center justify-center px-4 py-6">
        <div className="w-full max-w-4xl">
          <div className="bg-white/95 backdrop-blur shadow-2xl rounded-2xl overflow-hidden border border-slate-100 grid grid-cols-1 md:grid-cols-2">
            {/* LEFT INTRO */}
            <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 text-white p-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium mb-4">
                  <GroupsOutlinedIcon fontSize="small" />
                  <span>JobOnline Admin Portal</span>
                </div>
                <h2 className="text-2xl font-bold mb-3">
                  {t("login.adminTitle")}
                </h2>
                <p className="text-sm text-purple-100 leading-relaxed">
                  {t("login.description")}
                </p>
              </div>

              <div className="mt-6 border-t border-white/20 pt-4 text-xs text-purple-100/90">
                <p>• {t("login.feature1")}</p>
                <p>• {t("login.feature2")}</p>
                <p>• {t("login.feature3")}</p>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                {t("login.signIn")}
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                {t("login.adminTitle")}
              </p>

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
                    className="absolute right-3 top-[38px] text-slate-500 hover:text-purple-700"
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>

                {authError && (
                  <p className="text-red-600 text-sm text-center">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 inline-flex justify-center items-center rounded-md bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {loading ? t("login.signingIn") : t("login.signIn")}
                </button>

                <div className="flex items-center justify-between mt-1">
                  <a
                    href="#"
                    className="text-xs sm:text-sm text-purple-700 hover:underline"
                  >
                    {t("login.forgotPassword")}
                  </a>
                </div>
              </form>

              {/* REGISTER BOX */}
              <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-xs sm:text-sm">
                <span className="text-slate-600">{t("login.newEmployer")}</span>{" "}
                <a
                  href="/admin/register"
                  className="text-purple-700 font-semibold underline underline-offset-2"
                >
                  {t("login.register")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
