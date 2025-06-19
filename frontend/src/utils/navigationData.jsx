import {
  AppstoreOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SettingOutlined,
  SearchOutlined,
} from "@ant-design/icons";

export const instructorNavigationItems = [
  {
    key: "1",
    icon: <AppstoreOutlined />,
    label: "Dashboard",
    path: "dashboard",
  },
  {
    key: "2",
    icon: <BookOutlined />,
    label: "Courses",
    path: "courses",
  },
  // {
  //   key: "3",
  //   icon: <QuestionCircleOutlined />,
  //   label: "Quizzes",
  //   path: "quizzes",
  // },
  {
    key: "4",
    icon: <TeamOutlined />,
    label: "Students",
    path: "students",
  },
  // {
  //   key: "5",
  //   icon: <SettingOutlined />,
  //   label: "Settings",
  //   path: "settings",
  // },
  {
    key: "7",
    label: "Logout",
    icon: <LogoutOutlined />,
    path: "logout",
  },
];

export const studentNavigationItems = [
  {
    key: "1",
    icon: <AppstoreOutlined />,
    label: "Dashboard",
    path: "dashboard",
  },
  {
    key: "2",
    icon: <BookOutlined />,
    label: "My Courses",
    path: "courses",
  },
  {
    key: "3",
    icon: <SearchOutlined />,
    label: "Explore Courses",
    path: "explore-courses",
  },
  {
    key: "4",
    icon: <QuestionCircleOutlined />,
    label: "Quizzes",
    path: "quizzes",
  },
  {
    key: "5",
    icon: <FileTextOutlined />,
    label: "Assignments",
    path: "assignments",
  },
  {
    key: "6",
    icon: <TrophyOutlined />,
    label: "Grades",
    path: "grades",
  },
  {
    key: "7",
    icon: <SettingOutlined />,
    label: "Settings",
    path: "settings",
  },
  {
    key: "8",
    label: "Logout",
    icon: <LogoutOutlined />,
    path: "logout",
  },
];
