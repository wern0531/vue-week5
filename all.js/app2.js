const apiUrl = "https://vue3-course-api.hexschool.io/v2";
const apiPath = "wern";

Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== "default") {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL("./zh_TW.json");

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize("zh_TW"),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const productModal = {
  props: ["product", "addCart"],
  data() {
    return {
      modal: {},
      qty: 1,
      // tempProduct: {},
    };
  },
  template: "#userProductModal",
  methods: {
    hide() {
      this.qty = 1;
      this.modal.hide();
    },
  },
  watch: {
    product() {
      // this.tempProduct = this.product;
      this.modal.show();
    },
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
  },
};

const app = Vue.createApp({
  data() {
    return {
      products: [],
      product: {},
      carts: [],
      user: {
        name: "",
        email: "",
        tel: "",
        address: "",
      },
      message: "",
      loadingItem: "",
      isLoading: false,
    };
  },
  methods: {
    getProducts() {
      axios
        .get(`${apiUrl}/api/${apiPath}/products`)
        .then((res) => {
          this.products = res.data.products;
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    getProductModal(id) {
      axios
        .get(`${apiUrl}/api/${apiPath}/product/${id}`)
        .then((res) => {
          this.product = res.data.product;
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    addCart(product_id, qty = 1) {
      const data = {
        product_id: product_id,
        qty: qty,
      };
      axios
        .post(`${apiUrl}/api/${apiPath}/cart`, { data })
        .then((res) => {
          console.log(product_id);
          this.doAjax();
          this.getCart();
          this.$refs.productModal.hide();
          alert("已加入購物車");
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    getCart() {
      axios
        .get(`${apiUrl}/api/${apiPath}/cart`)
        .then((res) => {
          this.carts = res.data.data.carts;
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    updateQty(product_id, qty, id) {
      const data = {
        product_id: product_id,
        qty: qty,
      };
      this.loadingItem = product_id;
      axios
        .put(`${apiUrl}/api/${apiPath}/cart/${id}`, { data })
        .then((res) => {
          console.log(product_id, qty);
          this.getCart();
          this.loadingItem = "";
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    delCart(cartId, productId) {
      axios
        .delete(`${apiUrl}/api/${apiPath}/cart/${cartId}`)
        .then((res) => {
          const index = this.products.findIndex(
            (item) => item.id === productId
          );
          alert(`商品 ${this.products[index].title} 已刪除`);
          this.getCart();
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    delCarts() {
      if (this.carts.length > 0) {
        axios
          .delete(`${apiUrl}/api/${apiPath}/carts`)
          .then((res) => {
            this.getCart();
            alert("購物車已清空");
          })
          .catch((err) => {
            alert(err.response.data.message);
          });
      } else {
        alert("購物車是空的,請先將商品加入購物車!!");
      }
    },
    calculateTotal(carts) {
      return carts.reduce(
        (acc, cur) => acc + cur.product.origin_price * cur.qty,
        0
      );
    },
    calculateFinalTotal(carts) {
      return carts.reduce((acc, cur) => acc + cur.total, 0);
    },

    // 驗證用
    isPhone(value) {
      const phoneNumber = /^(09)[0-9]{8}$/;
      return phoneNumber.test(value) ? true : "需要正確的電話號碼";
    },
    onSubmit() {
      const data = {
        user: this.user,
        message: this.message,
      };
      if (this.carts.length > 0) {
        axios
          .post(`${apiUrl}/api/${apiPath}/order`, { data })
          .then((res) => {
            alert(res.data.message);
            this.doAjax();
            this.$refs.form.resetForm();
            this.getCart();
          })
          .catch((err) => {
            alert(err.response.data.message);
          });
      } else {
        alert("購物車沒有東西喔!!");
      }
    },
    doAjax() {
      this.isLoading = true;
      // simulate AJAX
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    },
  },
  components: {
    productModal,
  },
  mounted() {
    this.getProducts();
    this.getCart();
  },
});

app.component("VForm", VeeValidate.Form);
app.component("VField", VeeValidate.Field);
app.component("ErrorMessage", VeeValidate.ErrorMessage);

app.component("loading", VueLoading.Component);

app.mount("#app");
