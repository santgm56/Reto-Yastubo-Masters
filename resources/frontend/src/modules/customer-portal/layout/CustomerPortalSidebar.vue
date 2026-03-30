<template>
  <aside class="shell-sidebar" :class="{ 'is-open': mobileMenuOpen }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <svg class="sidebar-logo-img" width="181" height="40" viewBox="0 0 181 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M85.1917 21.0825H90.6504C90.6504 21.1253 90.6975 21.1896 90.7318 21.2752C90.8007 21.4273 90.8869 21.5709 90.9886 21.7033C91.1269 21.9095 91.3009 22.0893 91.5024 22.2342C91.7777 22.4234 92.0811 22.5679 92.4015 22.6624C92.817 22.7932 93.2504 22.8583 93.6859 22.8551C95.1801 22.8551 95.9336 22.4826 95.9336 21.7333C95.9336 21.3052 95.5911 21.0012 94.9061 20.7528C94.0898 20.4697 93.2578 20.2339 92.4143 20.0464C91.4256 19.8165 90.4507 19.5306 89.4944 19.1901C88.5275 18.8511 87.6687 18.2598 87.007 17.4775C86.305 16.6403 85.9389 15.5723 85.9794 14.4804C85.9863 13.7695 86.1613 13.0703 86.4902 12.44C86.8191 11.8097 87.2926 11.2662 87.8718 10.854C89.1362 9.84927 90.913 9.34549 93.2021 9.34263C94.4311 9.32314 95.654 9.51875 96.8156 9.92063C97.7084 10.2081 98.5289 10.6841 99.2217 11.3164C99.7313 11.817 100.184 12.3727 100.57 12.9733C100.868 13.404 101.091 13.8816 101.23 14.3862L101.392 14.9643H96.1092C96.1037 14.9021 96.0878 14.8413 96.0621 14.7844C95.9944 14.6514 95.9186 14.5228 95.8352 14.3991C95.7152 14.2203 95.5711 14.059 95.407 13.9196C95.184 13.7496 94.9335 13.6192 94.6663 13.5342C94.2994 13.4118 93.9143 13.3525 93.5275 13.3587C92.2431 13.3587 91.6009 13.7326 91.6009 14.4804C91.6009 14.8886 91.9434 15.2097 92.6284 15.4438C93.443 15.7152 94.2738 15.9354 95.1159 16.1031C96.1061 16.3115 97.0827 16.5803 98.0401 16.908C99.0028 17.2318 99.8615 17.8068 100.528 18.5736C101.229 19.4011 101.595 20.4609 101.555 21.5449C101.553 22.309 101.367 23.0613 101.012 23.7381C100.657 24.4149 100.144 24.9961 99.5172 25.4325C98.1557 26.4801 96.2133 27.0039 93.6902 27.0039C92.412 27.0366 91.1381 26.8438 89.9269 26.4344C88.9949 26.1292 88.1404 25.6252 87.4223 24.9573C86.8937 24.427 86.4256 23.8397 86.0265 23.2062C85.7209 22.7443 85.483 22.2411 85.3201 21.7119L85.1917 21.0825Z" fill="#1E1E2D"/>
        <path d="M102.848 14.1762V9.84328H104.937V6.31104H110.396V9.84328H114.728V14.1762H110.396V22.204H115.05V26.5412H104.937V14.1762H102.848Z" fill="#1E1E2D"/>
        <path d="M45.938 9.59521H51.6707L55.3699 17.8885L58.4824 9.59521H64.2195L54.5692 31.6707H48.8022L52.4114 24.0539L45.938 9.59521Z" fill="#1E1E2D"/>
        <path d="M64.9811 22.7603C64.2908 21.3356 63.9321 19.773 63.9321 18.1898C63.9321 16.6066 64.2908 15.044 64.9811 13.6193C65.6357 12.2808 66.6421 11.1456 67.8925 10.3354C69.1373 9.53334 70.5904 9.11496 72.0711 9.13227C73.2763 9.11262 74.4657 9.40777 75.5219 9.98857C76.4795 10.5049 77.2631 11.2929 77.7739 12.2535H77.928V9.60322H83.0657V26.7763H77.928V24.3102H77.7696C77.1501 25.2703 76.2953 26.0559 75.2864 26.5922C74.2759 27.0485 73.1751 27.2695 72.0668 27.2388C70.5861 27.2561 69.133 26.8377 67.8882 26.0357C66.6408 25.2268 65.6362 24.0949 64.9811 22.7603ZM77.1574 18.1962C77.2095 17.102 76.8402 16.0294 76.1255 15.1992C75.7667 14.8148 75.3284 14.5134 74.8411 14.3159C74.3538 14.1185 73.8293 14.0298 73.3041 14.056C72.7919 14.0287 72.2799 14.1156 71.8053 14.3103C71.3307 14.5051 70.9053 14.8028 70.5598 15.182C69.9148 16.0481 69.5664 17.0992 69.5664 18.1791C69.5664 19.259 69.9148 20.31 70.5598 21.1762C70.9053 21.5554 71.3307 21.8531 71.8053 22.0478C72.2799 22.2426 72.7919 22.3294 73.3041 22.3022C73.8277 22.3282 74.3507 22.2412 74.8376 22.0469C75.3245 21.8525 75.7638 21.5556 76.1255 21.1762C76.8395 20.3523 77.209 19.2852 77.1574 18.1962Z" fill="#1E1E2D"/>
        <path d="M117.972 23.7199C117.321 22.5968 116.986 21.3188 117 20.0207V9.63379H122.275V20.3376C122.257 20.61 122.3 20.8831 122.401 21.1366C122.503 21.39 122.66 21.6174 122.862 21.8018C123.35 22.1775 123.96 22.359 124.574 22.3113C124.881 22.3387 125.19 22.3052 125.484 22.2126C125.778 22.12 126.051 21.9702 126.287 21.7719C126.47 21.5821 126.612 21.357 126.705 21.1104C126.797 20.8637 126.839 20.6008 126.826 20.3376V9.63379H132.131V20.0122C132.149 21.3144 131.818 22.5978 131.172 23.7285C130.536 24.8181 129.607 25.708 128.492 26.2974C127.287 26.9352 125.941 27.2578 124.579 27.2351C123.22 27.2599 121.877 26.9371 120.678 26.2974C119.557 25.7025 118.621 24.8109 117.972 23.7199Z" fill="#1E1E2D"/>
        <path d="M139.81 24.3361H139.655V26.8022H134.518V4.79102H139.822V12.3051H139.977C140.508 11.3425 141.312 10.5588 142.289 10.053C143.368 9.4729 144.578 9.17815 145.804 9.19668C147.22 9.18407 148.607 9.60213 149.781 10.3955C150.993 11.2226 151.965 12.3556 152.598 13.6794C153.297 15.1046 153.652 16.6736 153.634 18.2606C153.65 19.8319 153.296 21.3849 152.602 22.7947C151.968 24.1129 150.996 25.2399 149.785 26.0615C148.613 26.8581 147.225 27.2779 145.808 27.2646C144.648 27.2849 143.496 27.0587 142.43 26.601C141.361 26.1067 140.453 25.3219 139.81 24.3361ZM147.978 18.2349C148.03 17.151 147.684 16.0854 147.007 15.2379C146.661 14.8555 146.234 14.556 145.756 14.3618C145.279 14.1676 144.764 14.0836 144.249 14.1161C143.726 14.088 143.204 14.1755 142.718 14.3724C142.233 14.5692 141.797 14.8706 141.441 15.255C140.737 16.0904 140.374 17.1609 140.426 18.2521C140.376 19.3353 140.739 20.3972 141.441 21.2234C141.799 21.6044 142.235 21.9025 142.721 22.097C143.206 22.2915 143.727 22.3777 144.249 22.3495C144.764 22.3815 145.279 22.2968 145.757 22.1018C146.234 21.9068 146.661 21.6066 147.007 21.2234C147.688 20.3814 148.034 19.3169 147.978 18.2349Z" fill="#1E1E2D"/>
        <path d="M156.541 22.7481C155.734 21.3719 155.309 19.8052 155.309 18.2097C155.309 16.6142 155.734 15.0476 156.541 13.6713C157.358 12.3064 158.514 11.1765 159.897 10.3919C161.281 9.60727 162.844 9.19482 164.434 9.19482C166.025 9.19482 167.588 9.60727 168.971 10.3919C170.354 11.1765 171.511 12.3064 172.327 13.6713C173.134 15.0476 173.56 16.6142 173.56 18.2097C173.56 19.8052 173.134 21.3719 172.327 22.7481C171.522 24.1191 170.374 25.2567 168.996 26.0492C167.608 26.8458 166.035 27.265 164.434 27.265C162.834 27.265 161.261 26.8458 159.872 26.0492C158.494 25.2567 157.346 24.1191 156.541 22.7481ZM168.29 18.2354C168.29 16.9167 167.928 15.9091 167.206 15.2127C166.838 14.861 166.402 14.587 165.926 14.4068C165.449 14.2266 164.941 14.144 164.432 14.1637C163.925 14.1438 163.42 14.2265 162.946 14.4067C162.473 14.587 162.04 14.8611 161.675 15.2127C160.964 15.9105 160.613 16.9253 160.613 18.2354C160.58 18.782 160.659 19.3295 160.845 19.8447C161.03 20.3599 161.318 20.832 161.692 21.2325C162.051 21.5897 162.479 21.8697 162.95 22.0553C163.422 22.2408 163.926 22.328 164.432 22.3114C164.941 22.3274 165.449 22.2401 165.923 22.0546C166.398 21.8692 166.83 21.5895 167.194 21.2325C167.571 20.8343 167.863 20.363 168.052 19.8475C168.24 19.332 168.321 18.7834 168.29 18.2354Z" fill="#1E1E2D"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M177.51 9.19482C178.074 9.19482 178.627 9.34378 179.115 9.62646C179.602 9.90543 180.008 10.3072 180.292 10.7915C180.577 11.2786 180.728 11.8332 180.728 12.3979C180.728 12.9629 180.577 13.5181 180.292 14.0054C180.008 14.4912 179.602 14.8951 179.115 15.1763C178.751 15.3868 178.348 15.5234 177.931 15.5786C177.514 15.6338 177.09 15.6062 176.683 15.4976C176.277 15.3889 175.895 15.2018 175.561 14.9458C175.227 14.6898 174.947 14.3698 174.736 14.0054C174.525 13.641 174.388 13.239 174.333 12.8218C174.277 12.4046 174.305 11.9803 174.414 11.5737C174.522 11.1671 174.71 10.7857 174.966 10.4517C175.222 10.1177 175.542 9.83714 175.906 9.62646C176.393 9.34379 176.947 9.1949 177.51 9.19482ZM177.503 9.95654C177.073 9.95287 176.651 10.067 176.282 10.2866C175.913 10.5015 175.606 10.8086 175.391 11.1772C175.175 11.5453 175.062 11.966 175.066 12.3931C175.061 12.8254 175.173 13.251 175.391 13.6245C175.607 13.9954 175.914 14.3063 176.282 14.5269C176.65 14.7482 177.073 14.8645 177.503 14.8628C177.936 14.8637 178.361 14.7475 178.734 14.5269C179.104 14.3051 179.415 13.9947 179.636 13.6245C179.856 13.2516 179.97 12.8259 179.966 12.3931C179.968 11.9655 179.855 11.5449 179.636 11.1772C179.416 10.8091 179.105 10.5026 178.734 10.2866C178.361 10.0677 177.935 9.95368 177.503 9.95654ZM177.563 11.0708C177.692 11.0734 177.82 11.1009 177.938 11.1528C178.056 11.2046 178.162 11.2795 178.252 11.3726C178.346 11.4626 178.421 11.5715 178.471 11.6919C178.521 11.8123 178.546 11.9423 178.544 12.0728C178.546 12.2289 178.498 12.3823 178.409 12.5103C178.313 12.6375 178.185 12.7378 178.039 12.8013L178.526 13.6919H177.725L177.295 12.8511H177.227V13.7026H176.572V11.0708H177.563ZM177.233 11.731V12.3862H177.608C177.685 12.3696 177.755 12.3311 177.809 12.2749V12.2915C177.863 12.2298 177.892 12.1497 177.888 12.0679C177.89 11.9862 177.861 11.9062 177.809 11.8433C177.758 11.7831 177.686 11.7428 177.608 11.731H177.233Z" fill="#1E1E2D"/>
        <path d="M0 9.06508C0.0599393 7.87054 0.0513724 6.66744 0.209783 5.48574C0.255339 5.24453 0.350387 5.01538 0.48892 4.81273C0.627453 4.61009 0.806469 4.43834 1.01469 4.30833C12.8655 -1.70862 24.568 -1.42318 36.122 5.16463C36.3556 5.3222 36.5529 5.52786 36.7005 5.76784C36.8482 6.00782 36.9429 6.27657 36.9783 6.55612C37.5563 20.9206 31.725 31.9497 19.5873 39.6565C18.8081 40.1531 18.2216 40.0846 17.4466 39.6222C6.17375 32.5449 0.479515 22.3078 0 9.06508ZM17.3953 4.63801C13.322 4.67385 9.29706 5.52397 5.55722 7.1384C5.25577 7.22094 4.99346 7.40788 4.81702 7.66588C4.64059 7.92387 4.56151 8.23616 4.59391 8.54703C4.64529 19.3407 9.07224 27.8866 17.7035 34.3089C17.9271 34.5295 18.2285 34.6533 18.5427 34.6533C18.8568 34.6533 19.1583 34.5295 19.3818 34.3089C27.7733 28.0921 32.2259 19.8117 32.5085 9.34339C32.5493 9.01549 32.4763 8.68354 32.3018 8.40299C32.1272 8.12245 31.8617 7.91029 31.5495 7.80203C27.1379 5.67177 22.294 4.58898 17.3953 4.63801Z" fill="#1E1E2D"/>
        <path d="M27.5281 11.1928C26.5006 16.1422 24.026 23.2581 18.1091 28.276C18.0257 28.3424 17.9224 28.3785 17.8158 28.3785C17.7093 28.3785 17.6059 28.3424 17.5225 28.276C16.2555 27.2986 15.0921 26.1939 14.0503 24.9792C14.0114 24.9319 13.9823 24.8773 13.9646 24.8186C13.947 24.76 13.9412 24.6983 13.9475 24.6374C13.9539 24.5764 13.9723 24.5174 14.0017 24.4636C14.0312 24.4098 14.071 24.3624 14.1188 24.3242C15.2787 23.3858 16.3222 22.3121 17.2271 21.1259C14.0098 18.3221 11.655 14.6621 10.4369 10.572C10.4045 10.4606 10.4151 10.3412 10.4667 10.2373C10.5182 10.1334 10.6069 10.0527 10.7152 10.0111C12.2048 9.44837 13.7529 9.05485 15.3305 8.83799C15.4388 8.82553 15.5481 8.85177 15.639 8.9121C15.7299 8.97243 15.7965 9.06294 15.8271 9.16765C16.6459 11.8388 18.1173 14.2639 20.1085 16.2236C21.0425 14.0882 21.7346 11.8551 22.1721 9.56582C22.1839 9.50533 22.2075 9.4478 22.2418 9.39659C22.2761 9.34538 22.3202 9.30151 22.3717 9.2676C22.4231 9.2337 22.4808 9.21042 22.5414 9.19914C22.602 9.18785 22.6642 9.1888 22.7244 9.20191C24.3182 9.65486 25.8789 10.2171 27.3954 10.8845C27.4502 10.9121 27.4936 10.9582 27.5179 11.0145C27.5421 11.0709 27.5458 11.134 27.5281 11.1928Z" fill="#4BBD7D"/>
      </svg>
      <button
        class="btn btn-sm btn-icon d-lg-none sidebar-close"
        type="button"
        aria-label="Cerrar menu"
        @click="$emit('close-mobile-menu')"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <!-- Profile -->
    <div class="sidebar-profile">
      <div class="profile-avatar-wrap">
        <img v-if="userAvatarUrl" :src="userAvatarUrl" :alt="userName" class="profile-avatar-image" />
        <div v-else class="profile-avatar-fallback">{{ resolvedInitials }}</div>
      </div>
      <div class="profile-name">{{ userName }}</div>
      <button class="btn profile-link-btn" type="button" @click="$emit('open-profile')">
        {{ profileLabel }}
      </button>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <button
        v-for="item in resolvedMenuItems"
        :key="item.key"
        class="nav-item"
        :class="{ 'is-active': item.path === currentPath }"
        type="button"
        :disabled="recoveryActionBusy"
        @click="$emit('navigate', item.routeName)"
      >
        <span class="nav-icon" v-html="menuGlyph(item.key)"></span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>

    <!-- Spacer -->
    <div class="sidebar-spacer"></div>

    <!-- Logout -->
    <div class="sidebar-bottom">
      <a class="nav-item logout-item" href="/customer/logout" data-fastapi-logout="true">
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" class="menu-icon-svg">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="16 17 21 12 16 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="nav-label">Salir</span>
      </a>
    </div>
  </aside>
</template>

<script>
const MENU_GLYPHS = {
  dashboard: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="menu-icon-svg">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.8"/>
      <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.8"/>
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.8"/>
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.8"/>
    </svg>`,
  productos: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="menu-icon-svg">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.8"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  beneficiarios: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="menu-icon-svg">
      <path d="M12 20.25s-6.75-3.92-6.75-9.15A3.85 3.85 0 019.13 7.25c1.12 0 2.2.48 2.87 1.33a3.82 3.82 0 012.87-1.33 3.85 3.85 0 013.88 3.85c0 5.23-6.75 9.15-6.75 9.15z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  transacciones: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="menu-icon-svg">
      <path d="M12 1v22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  'pagos-pendientes': `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="menu-icon-svg">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="1.8"/>
      <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
  'metodo-pago': `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="menu-icon-svg">
      <rect x="4.25" y="6.25" width="15.5" height="11.5" rx="2.5" stroke="currentColor" stroke-width="1.8"/>
      <path d="M4.75 10H19.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M8 14.25H10.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
};

export default {
  name: 'CustomerPortalSidebar',
  props: {
    mobileMenuOpen: {
      type: Boolean,
      default: false,
    },
    userName: {
      type: String,
      default: 'Cliente',
    },
    userMeta: {
      type: String,
      default: '',
    },
    userAvatarUrl: {
      type: String,
      default: '',
    },
    profileUrl: {
      type: String,
      default: '',
    },
    profileLabel: {
      type: String,
      default: 'Ver Perfil',
    },
    accountInitials: {
      type: String,
      default: '',
    },
    resolvedMenuItems: {
      type: Array,
      default: () => [],
    },
    currentPath: {
      type: String,
      default: '',
    },
    recoveryActionBusy: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    resolvedInitials() {
      if (`${this.accountInitials || ''}`.trim() !== '') {
        return `${this.accountInitials}`.trim().slice(0, 2).toUpperCase();
      }
      const source = `${this.userName || ''}`.trim();
      if (!source) return 'CL';
      const parts = source.split(/\s+/).filter(Boolean);
      const first = parts[0] ? parts[0].charAt(0) : 'C';
      const second = parts[1] ? parts[1].charAt(0) : (parts[0] && parts[0].charAt(1)) || 'L';
      return `${first}${second}`.toUpperCase();
    },
  },
  methods: {
    menuGlyph(key) {
      return MENU_GLYPHS[key] || `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="menu-icon-svg">
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>`;
    },
  },
  emits: ['close-mobile-menu', 'navigate', 'open-profile'],
};
</script>

<style scoped>
.shell-sidebar {
  width: 240px;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1040;
  background:
    radial-gradient(circle at 14% 84%, rgba(104, 229, 233, 0.28) 0%, rgba(104, 229, 233, 0) 28%),
    linear-gradient(180deg, #ffffff 0%, #ffffff 68%, #f6fbff 82%, #ece8ff 92%, #7564ff 100%);
  border-right: 1px solid #edf1f6;
  border-radius: 30px 0 0 30px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.shell-sidebar > * {
  position: relative;
  z-index: 1;
}

/* ── Logo ── */
.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 20px;
}

.sidebar-logo-img {
  height: 31px;
  width: auto;
}

.sidebar-close {
  border: 0;
  background: transparent;
  font-size: 1.25rem;
  color: #6b7280;
}

/* ── Profile ── */
.sidebar-profile {
  text-align: center;
  padding: 12px 20px 20px;
}

.profile-avatar-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}

.profile-avatar-image,
.profile-avatar-fallback {
  width: 68px;
  height: 68px;
  border-radius: 50%;
}

.profile-avatar-image {
  object-fit: cover;
  border: 2px solid #4bbd7d;
  box-shadow: 0 6px 18px rgba(75, 189, 125, 0.14);
}

.profile-avatar-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #4bbd7d 0%, #6ed19f 100%);
  border: 2px solid #4bbd7d;
}

.profile-name {
  font-weight: 600;
  font-size: 16px;
  line-height: 1.25;
  color: #2a3142;
}

.profile-link-btn {
  display: inline-block;
  margin-top: 6px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #7c8698;
  font-size: 13px;
  font-weight: 500;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 2px;
  transition: color 0.15s ease, text-decoration-color 0.15s ease;
}

.profile-link-btn:hover {
  color: #4f46e5;
  text-decoration-color: currentColor;
}

/* ── Navigation ── */
.sidebar-nav {
  padding: 4px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  min-height: 44px;
  gap: 10px;
  padding: 0 14px;
  border-radius: 22px;
  border: 1px solid transparent;
  background: transparent;
  color: #7b8497;
  font-size: 14px;
  line-height: 1.2;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.nav-item:hover {
  background: #f7f8fc;
  color: #2f3651;
}

.nav-item.is-active {
  background: #ffffff;
  border-color: #e8ecf4;
  box-shadow: 0 4px 14px rgba(17, 24, 39, 0.05);
  color: #2f3651;
  font-weight: 600;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.shell-sidebar :deep(.menu-icon-svg) {
  width: 18px;
  height: 18px;
}

.nav-item:hover .nav-icon {
  color: #5f6b85;
}

.nav-item.is-active .nav-icon {
  color: #6d5ef6;
}

.nav-label {
  white-space: nowrap;
}

/* ── Spacer ── */
.sidebar-spacer {
  flex: 1;
}

/* ── Bottom / Logout ── */
.sidebar-bottom {
  padding: 0 20px 24px;
}

.logout-item {
  min-height: 40px;
  padding: 0 12px;
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.78);
}

.logout-item:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

/* ── Mobile ── */
@media (max-width: 991.98px) {
  .shell-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    border-radius: 0 28px 28px 0;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    box-shadow: 12px 0 30px rgba(14, 36, 72, 0.2);
  }

  .shell-sidebar.is-open {
    transform: translateX(0);
  }
}
</style>
