import { Product, BlogPost } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Hộp Quà Phú Quý",
    category: "Hộp quà",
    price: 1250000,
    originalPrice: 1500000,
    rating: 4.8,
    reviews: 45,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgHcnHgGvA8mCEWpq-ap5oelP7Kn0BHJ7lOhEaaSURbcRn5xMNj4vaytN2pS6KbaDveIbBVuNYD6xWFOCoQUNd9hZ35AGkiYhAl2fjwkaa25d2wLYxNUWU-Z-cZ8VvVdvqOhnxyEKjEZaV7j5Om0hJj-3pH5EuzaDP5aKbzI9By3Pjsbh3vI0yT8R_FLMEcp8THrUNM6tXZa4-B8DyPUf2s3ZrQNhBddfXrZ9Ucnw4KmQbhX2Vx1dvhOQq9Tf70yC3aPJqPI9T9bU",
    discount: 15
  },
  {
    id: 2,
    name: "Giỏ Quà Tài Lộc",
    category: "Giỏ quà",
    price: 850000,
    rating: 5.0,
    reviews: 120,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqQAJ-wYiQSJyhVsfmKxGPDjHO5R0TU90kPgjZM0cnOIBJthk605iSwF8WjPJ_KyqSHlGzQPqSSD4H_8kVDjQn1QDdGsXIZbHw2ECx3Ws_uFsIz0ja3J_C7ZnPcQrylsVIdVkY01f9eIq3uDiSoeC4VD7HWKHp3P1u4XEuJS_5REpncuAcVrpm5nsnO5j2PpZ0_J7Cat9GfjasI6IenITjJiRsMrgDDlEbvG_s19Cc7576vSpfBU3KKLpAwLcKbtJw3ao2Gwf8NmI",
    isHot: true
  },
  {
    id: 3,
    name: "Rượu Vang Premium",
    category: "Rượu Tết",
    price: 2100000,
    rating: 4.9,
    reviews: 24,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRLA-CNP5rr4aesuvK68qWvEOxSVP5aaRGVLh036XeVn8bdqNNHDV--GqIf18K7Kag9kKQ6L9ZSiXAY6Zn2-ss8N33hlnzDu_DXbK3PNKTj8VIDvbAGL8ZptxbgJxls-dQyQqbDvrIu2Hv4ZhIxqOAVzmKwuUilkPkQFIR0UqUPfH4fBhpDGj_8aVuAyXkmOWH14xkqU9EYP3VH6ezIGNOh12WDttR4I-xReFA4p8_lov8qo_yJsjGFCHYjWULoY06IzlrjrOP-54"
  },
  {
    id: 4,
    name: "Set Hạt Dinh Dưỡng",
    category: "Hộp quà",
    price: 550000,
    originalPrice: 600000,
    rating: 4.7,
    reviews: 89,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-m8NKucgzcxvH9rmSZyoN-JmE6l2KRyTblP2TvKYJIr4AARqQ-b6M_GdcZuradtDA-yT4DgNL1NtrJArGgfmyavV9psWpJHEfXB6jXaJJgXfI9fCgEvKMiXn-yrV-e0C5XbfMrR-jR1hGHB1TpZOKapM8cNKFo-g_Z5IGp08d47avkgudHQ7fNFu4sZXnZWFONEYANppmFGsXysGAWq-QXnqxmXutNQqtYaH8IC2PXYWvPzwRHawkgtt06DMVHAmWqOOO-paek-I",
    discount: 10
  },
  {
    id: 5,
    name: "Set Trà An Khang",
    category: "Hộp quà",
    price: 450000,
    rating: 4.6,
    reviews: 56,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6plfdsvdSGMBRfOiUqU7x3qo_AXr2WOwcXxa70ww5zRXdSsXcxQ41zGhGsmWPBTaoeEViXjvYVD56nVFbu2SiXkh5c9nPVJEjtFwscen7wH8TCDPrC4xxwEM2txu1V49yCi_15BkZ5ROI3O2e_Q9JSLVxy7nI0G-hUjHfkvS2h4CAHxDRXoprE_Ggy_me0B7rLPRcfef4FxIWLn8hn7bqnurOkzWyyouY3dxBZ-n7-PPxqQo45I4PR-DCjhL0D36LfJkmAu0RoMc"
  },
  {
    id: 6,
    name: "Giỏ Trái Cây Nhập Khẩu",
    category: "Giỏ quà",
    price: 1500000,
    rating: 4.8,
    reviews: 12,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmzlhDzep4CDU4qjmW9bYVURGUaSLxk78Viia7wpPVecpAdNYJx_S2bQmgSCDYMMZIFCIuO9MXyEQWpmttwfvMrRE8ZhA0jPe8aKS3WkwNgsIkdNSTYFcJ7xWSTeBf3ogEUqua8_Ehv_RGQkxm2tVS1y32hBhVHY-piBh-t6V_e2EI_IAqbf2CvlFhOEpCwi-pggTesji1kx7VpQXlmlWXS6y6aHH1AlHl15KYyfSQI55Q23XBMUWgKvrzuXHfQxhp3jADDH8tqL4"
  },
  {
    id: 7,
    name: "Hộp Chocolate Thịnh Vượng",
    category: "Hộp quà",
    price: 320000,
    rating: 4.9,
    reviews: 34,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9DVP8QYTLWEDELOVVdPBEkgrNGXTudcNTJG7hEBSPczUEpUvP8ibv6hgIw-obTXRQzNMaexqS97M2oZrV1DobJS9Rauk8A7fapf9xBN4ZCF3nLmrlr3fNQ3n57pnzJxI8OzpgYHJQg06m5FCn69e_gu1bVkyupAzV9YY7XdL5EFNVPMRuqMkdHPDKnmbKiINH5kupJkJCMjY6XwGR-FkgjNO0DMRgJlagIr-t2LaNQNMf4jUNncP0WN-B4SbyFj5en2DdyKhRk-I"
  },
  {
    id: 8,
    name: "Bánh Mứt Cổ Truyền",
    category: "Truyền thống",
    price: 250000,
    rating: 4.5,
    reviews: 28,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgwI8Z6KnKhABmLD-0iUqf-VqsgrezCqi3XBx1XJkt7OT2IOGV2DDqL9GXPsXnz8TG9z-Cp0Bv5ek43pTo566c8FLxUN989ChbHiJGNCIX4pmfzuNIoUzbDTEqFxgX8tpSy9k3pLIPcA5A53IZk8pf49nIulOhnCEEq4K-L-TLK9S4pZxbBq9TT9JxdKsLTB6hhsVTZkan_WhRi16ZBVhFTeNDOSbns6G-pHMH-EcvYlLmap1gOLo5kZivWxyCZeKocaKTx7nFGyA"
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Cách Chọn Giỏ Quà Tết Sang Trọng Cho Đối Tác",
    excerpt: "Bí quyết lựa chọn những set quà vừa thể hiện sự chuyên nghiệp, vừa mang đậm dấu ấn văn hóa.",
    date: "12 Jan, 2024",
    readTime: "5 min",
    tag: "Gift Tips",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlBWvaMHBQxGn_x6I2WkSTFXY3Dsh7Bt30e1EugVz_E1q-wBLHq0V8U1hpIFE769nzLvl3sX25kpU9_1oBfFHPCtSFAtx2XEYRW4p1ooNXk4mlVc5ixmeFHJbm9CBQrTl6ZPwHF7i0w-C-_7JC1QDpNuzg-MVt0SzHwLERBBNT6esHkI-Vmdvb4VlKiR1oyLL5H1InVohcGVmsKooyrvY6Nye3bKTj0xZBOeX0tj_wZL8PoQ3qRezWNLi6a8fG4rv1R3ZFUpkH8Bo"
  },
  {
    id: 2,
    title: "Ra Mắt Bộ Sưu Tập Xuân Giáp Thìn 2024",
    excerpt: "Khám phá bộ sưu tập mới nhất với thiết kế bao bì độc đáo lấy cảm hứng từ rồng thiêng.",
    date: "10 Jan, 2024",
    readTime: "3 min",
    tag: "New Collections",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhQutXkcjc51gtDH-rrlzGLxUjXELp79G8vCslV7FcDgkX8alX0YCt5KEg1L8_8ZRbLNUJ9WJwKc5-I0HHHmn61VLvMzvmAr0VNymAaOSx2FvM9qLkfV1LsG5Bw0bc4sasC1etKuV2_aofXx4SGY6rSBr8EwZIgCWc0aVPIaZpUcgUB33a5v62oduI5ZQvyVzK41VPdWktojPLaUqDKxkY9mGcyKa3e_J39PlUDNee4TRsppwMIYrrFVG48gjjV9mn6L66larLKMU"
  },
  {
    id: 3,
    title: "Những Phong Tục Đón Tết Của Người Việt Xưa Và Nay",
    excerpt: "Tìm hiểu về sự thay đổi và những giá trị bất biến trong văn hóa đón Tết cổ truyền.",
    date: "08 Jan, 2024",
    readTime: "7 min",
    tag: "Tet Traditions",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwXFIRC3Jdlb52WZWHa2iQlPxhPfgb5LV25uR4vpaEzHK97Cc4oQipA06HlylO2Jb-Mc-d3xrwLwLE6Ua0mWq16p94H7oeMRKINb2h2BsNMMKxq0tRUUF-Yw0jgLgVHKyaXGdwskGIu1HUdVyXoHdIs7uu3Rs_G_2w-1f9NMq6UaFhlu-brsa3YNB709kFbyv9P5VqbQ_4WdzCVwouMl6Oi48fxPLvH8i0sYIs7M1ivkxf3hEXzuYYtukLOqB2ijrCMEoPR8YEE6Y"
  }
];
