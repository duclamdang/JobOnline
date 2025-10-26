src/
├── admin/                        # Phần dành riêng cho admin
│   ├── components/               # Components chỉ admin dùng
│   │   ├── AdminLoginForm.tsx    # Form login cho admin
│   │   ├── AdminRegisterForm.tsx # Form đăng ký cho admin
│   │   ├── DashboardChart.tsx    # Chart cho dashboard (recharts)
│   │   └── ...
│   ├── pages/                    # Pages cho admin
│   │   ├── AdminLogin.tsx        # Trang login admin
│   │   ├── AdminRegister.tsx     # Trang đăng ký admin
│   │   ├── AdminDashboard.tsx    # Trang dashboard
│   │   ├── AdminUsers.tsx        # Trang quản lý users
│   │   └── ...
│   ├── context/                  # Redux slices cho admin
│   ├── api/                      # RTK Query endpoints cho admi
│   ├── hooks/                    # Custom hooks cho admin
│   │   ├── useAdminAuth.ts       # Hook check isAuthenticated, role
│   │   └── ...
│   └── routes/                   # Routes riêng cho admin
│   │   ├── adminRoutes.tsx       # Export routes: /admin/login, /admin/dashboard
│   │   └── ...
│
├── user/                         # Phần dành riêng cho user
│   ├── components/               # Components chỉ user dùng
│   │   ├── UserLoginForm.tsx     # Form login cho user
│   │   ├── UserRegisterForm.tsx  # Form đăng ký cho user
│   │   ├── ProfileEditor.tsx     # Editor profile user
│   │   └── ...
│   ├── pages/                    # Pages cho user
│   │   ├── UserLogin.tsx         # Trang login user
│   │   ├── UserRegister.tsx      # Trang đăng ký user
│   │   ├── Home.tsx              # Trang chủ
│   │   ├── Profile.tsx           # Trang profile user
│   │   └── ...
│   ├── context/                  # Redux slices cho user
│   ├── api/                      # RTK Query endpoints cho user
│   ├── hooks/                    # Custom hooks cho user
│   │   ├── useUserAuth.ts        # Hook check isAuthenticated, role
│   │   └── ...
│   └── routes/                   # Routes riêng cho user
│   │   ├── userRoutes.tsx        # Export routes: /login, /profile
│   │   └── ...
│
├── utils/                        # Tiện ích chung
│   ├── helpers.ts                # Format ngày tháng
│   ├── validation.ts             # Validate inputs
│   ├── constants.ts              # API_URL, ROLES = { ADMIN: 'admin', USER: 'user' }
│   └── ...
│
├── config/                        # Config chung
│   └── config.ts                  # Chứa các config, env
│
├── context/                      # Redux toàn cục
│   ├── store.ts                  # Configure store
│   ├── hooks.ts                  # Typed hooks: useAppDispatch, useAppSelector
│   └── ...
│
├── locales/                      # Language
│   ├── en.json                   # Tiếng anh
│   ├── vi.json                   # Tiếng việt
│   └── ...
│
├── types/                        # Types chung
│   └── authTypes.ts              # Interface User, AuthState
│
├── api/                          # API base
│   └── baseApi.ts                # Setup RTK Query base
│
├── assets/                       # Images, icons, styles
│   ├── images/
│   ├── styles/global.css         # Global CSS (hoặc Tailwind)
│   └── ...
│
├── hooks/                        # Hooks chung
│   ├── useDebounce.ts            # Debounce cho search
│   └── ...
│
├── App.tsx                       # Root: Provider Redux, Router
├── main.tsx                      # Entry point (Vite)
└── routes.tsx                    # Routing chính: combine adminRoutes + userRoutes


├── client
│   ├──docker
│   │   ├──Dockerfile
│
├── server    
│   ├──docker
│   │   ├── config
│   │   ├── nginx_log
│   │   │   ├── access.log
│   │   │   ├── error.log
│   │   ├── php_fpm
│   │   │   ├── php-fpm.log
│   │   ├── Dockerfile                 
├── .dockerignore
└── docker-compose.yml