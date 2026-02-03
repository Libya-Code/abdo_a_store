// ===================
// تسجيل الدخول الا موقع
//====================
if (document.getElementById("login-container")) {
    document.getElementById("login-submit").addEventListener("click", function () {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        fetch('https://libya.onrender.com/api/login', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: password,
            })
        })
            .then(response => {
                if (!response.ok) throw new Error("فشل تسجيل الدخول");
                return response.json();
            })
            .then((data) => {
                sessionStorage.setItem("uid", data.uid);
                alert("تم تسجيل الدخول بنجاح!");
                window.location.replace("index.html");
            }).catch((error) => {
                alert("كلمت سر او بريد خطاء")
            })

    });
}

const uid = sessionStorage.getItem("uid");
if (document.getElementById("bley.submit")) {
    if (!uid) {
        window.location.replace("login.html");
    } else {
        async function getdata() {

            // جلب معلومات مستخدم
            const response = await fetch("https://libya.onrender.com/api/users/" + uid)
            const data = await response.json()
            console.log(data);
            // رصيد مستخدم
            Money = data.balance*2
            document.getElementById("Money").innerText = "رصيدك:" + Money + "$"
            // جزء الخاص بطلبات مستخدم
            async function loadOrders(data) {
                // ترتيب الطلبات
                const sortedOrders = Object.entries(data.orders)
                    .sort((a, b) => b[1].createdAt - a[1].createdAt);

                for (const [key, order] of sortedOrders) {
                    try {
                        const response = await fetch(`https://libya.onrender.com/api/get-bill?product_id=${order.orderId}`);
                        const data2 = await response.json();

                        console.log(data2);
                        document.getElementById("get-bill-product_id").innerHTML += `
                            <tr>
                                <th scope="row">${data2.order.id}</th>
                                <td>${data2.order.product_name}</td>
                                <td>${data2.order.customer_data.id}</td>
                                <td>${data2.order.status_label}</td>
                            </tr>
                        `;

                    } catch (error) {
                        console.error("خطأ في جلب الطلب:", order.orderId, error);
                    }
                }

                console.log("انتهت كل الطلبات");
            }

            // استدعاء الدالة
            loadOrders(data);

        }
        getdata()
    }
    async function getcategories() {
        const response = await fetch("https://libya.onrender.com/api/categories")
        const data = await response.json()
        for (const element of data.products) {
            document.getElementById("content").innerHTML += `
            <div class="centent" id="centent" onclick="getProductId(${element.id}, this , ${element.unit_price}) ">
                <h3 id="categories">${element.name}</h3>
                <p id="manny">${element.unit_price * 2}$</p>
            </div>
            `
        }

    }
    getcategories()


    let Money2 = null;
    let product_id = null;
    function getProductId(id, el, Mo) {
        let element = document.getElementsByClassName("boxs")
        for (const boxs of element) {
            boxs.classList.remove("boxs")
        }
        Money2 = Mo-Money
        el.classList.add("boxs")
        product_id = id;
    }

    async function sendOrder(orderId) {
        const uid = sessionStorage.getItem("uid");

        if (!uid) {
            alert("يرجى تسجيل الدخول");
            return;
        }

        const response = await fetch(`https://libya.onrender.com/api/users/${uid}/order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                orderId: orderId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(data.error);
            alert("خطأ في إرسال الطلب");
            return;
        }

        console.log("تم حفظ الطلب بنجاح", data);
    }

    function sendBill() {
        var x = document.getElementById("bley.id").value

        const data = {
            product_id: product_id,
            qty: "1",
            player_id: x,
            server_id: "1"
        };
        if (Money2 <= 0 ) {
            if (product_id != null) {
                fetch("https://libya.onrender.com/api/send-bill", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Request failed");

                        }
                        return response.json();
                    })
                    .then((result) => {
                        if (result.code == 200) {
                            console.log("===================" + Money);

                            document.getElementById("demand").innerHTML = `
                        <div class="alert alert-warning alert-dismissible fade show" role="alert">
                                <h4>تم انشاء طلب</h4>
                                <div style="text-align: right;">
                                    <h6>اسم الطلب:${result.order.product_name}</h6>
                                    <h6>ايدي اللاعب:${x}</h6>
                                </div>
                        </div>
                                 `
                            sendOrder(result.order.id)
                            console.log("Success:", result);
                            document.getElementById("bley.id").value = ''
                        } else if (result.code == 400) {
                            x.value = ''
                            alert("لا يوجد مخزون كافي");
                        }

                    })
                    .catch(error => {
                        console.error("Error:", error);
                        alert("فشل إرسال الطلب");
                    });
            } else {
                alert("يرجا اختيار منتج التي تريد شحنه")
            }
        }else{
            alert("رصيدك غير كافي")
        }


    }

}

