const { Sequelize, or } = require('sequelize')
const userModel = require('./model/user')
const authStatusModel = require('./model/authstatus')
const productModel = require('./model/product')
const orderModel = require('./model/order')
const customerModel = require('./model/customer')
const productOrderModel = require('./model/productorder')
const bcrypt = require('bcrypt')
require('dotenv/config')

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost:3306',
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || '123456',
    database: process.env.DATABASE_NAME || 'finalnodejs',
})

const User = userModel(sequelize);
const AuthStatus = authStatusModel(sequelize);
const Product = productModel(sequelize)
const Order = orderModel(sequelize)
const Customer = customerModel(sequelize)
const ProductOrder = productOrderModel(sequelize)

Product.belongsToMany(Order, { through: ProductOrder });
Order.belongsToMany(Product, { through: ProductOrder });

sequelize.sync()

const getAllProduct = async () => {
    Product.sync()

    try {
        const product = await Product.findAll()
        if (product) {
            return product
        }
        else {
            return null
        }
    }
    catch (err) {
        console.log(err)
        return null
    }
}

const getProduct = async (barcode) => {
    Product.sync()

    try {
        const product = await Product.findOne({
            where: {
                barcode: barcode
            }
        })

        if (product) {
            return product
        }
        else {
            return null
        }
    }
    catch (err) {
        console.log(err)
        return null
    }
}

const createAuthStatus = async (id, token) => {
    AuthStatus.sync()

    try {
        const auth = await AuthStatus.create({
            id: id,
            token: token
        })


        return auth
    }
    catch (err) {
        console.log(err)
        return null
    }
}

const getTokenVerifyAuthStatus = async (id) => {
    AuthStatus.sync()
    try {
        const auth = await AuthStatus.findByPk(id)
        await AuthStatus.destroy({
            where: {
                id: id
            }
        })
        return auth.token
    }
    catch {
        return null
    }
}

const changeUserActiveStatus = async (id) => {
    User.sync()

    try {
        const user = await User.update({
            active: 'true'
        },
            {
                where: {
                    id: id
                },
                returnning: true
            })

        return user
    }
    catch {
        return null
    }
}

const createUser = async (fullname, email, password) => {
    User.sync()

    try {
        const user = await User.destroy({
            where: {
                email: email
            }
        })
    }
    catch {

    }

    const hashed = await bcrypt.hash(password, 10)

    try {
        const newUser = await User.create({
            fullname: fullname,
            email: email,
            password: hashed,
            phone: null,
            country: null,
            permission: 'seller',
            active: "false",
            lock: 'false'
        })

        return newUser
    }
    catch {
        return null
    }
}

const authUserLogin = async (username, password) => {
    User.sync()

    try {
        var user = await User.findOne({
            where: {
                fullname: username,
            }
        })

        if (user) {
            const isvalid = await bcrypt.compare(password, user.password)

            if (isvalid) {
                return user
            }
            else {
                return null
            }
        }
        else {
            return null
        }


    }
    catch (err) {
        console.log(err)
        return null
    }
}

const getUser = async (email) => {
    User.sync()

    try {
        var user = await User.findOne({
            where: {
                email: email
            }
        })

        if (user) {
            return user
        }
        else {
            return null
        }
    }
    catch (err) {
        console.log(err)
        return null
    }
}

const getAllUser = async () => {
    User.sync()

    try {
        var user = await User.findAll({
            where: {
                permission: 'seller'
            }
        })

        if (user) {
            return user;
        }
        else {
            return null
        }
    }
    catch (err) {
        console.log(err)
        return null
    }
}

const changeUserPassword = async (email, password) => {
    User.sync()

    const hashed = await bcrypt.hash(password, 10)

    try {
        var user = await User.update({
            password: hashed
        },
            {
                where: {
                    email: email
                },
                returnning: true
            })

        if (user) {
            return user
        }
        else {
            return null
        }
    }
    catch (err) {
        console.log(err)
        return null
    }

}

const lockUser = async (email) => {
    User.sync()

    try {
        const user = await User.update({
            lock: 'true'
        },
            {
                where: {
                    email: email
                },
                returnning: true
            })

        if (user) {
            return user
        }
        else {
            return null
        }
    }
    catch (err) {
        console.log(err)
        return null
    }
}

const unblockUser = async (email) => {
    User.sync()

    try {
        const user = await User.update({
            lock: 'false'
        },
            {
                where: {
                    email: email
                },
                returnning: true
            })

        if (user) {
            return user
        }
        else {
            return null
        }
    }
    catch (err) {
        console.log(err)
        return null
    }
}

const addProduct = async (barcode, name, quantity, importprice, retailprice, category) => {
    Product.sync()

    try {
        const product = Product.create({
            barcode: barcode,
            name: name,
            quantity: quantity,
            importprice: importprice,
            retailprice: retailprice,
            category: category
        })

        if (product) {
            return product
        }
        else {
            return null
        }
    }
    catch (err) {
        return null
    }
}

const deleteProduct = async (barcode) => {
    Product.sync()
    ProductOrder.sync()

    try {
        const productorder = await ProductOrder.findAll({
            where: {
                ProductBarcode: barcode
            }
        })

        if (productorder.length === 0) {
            try {
                const product = await Product.destroy({
                    where: {
                        barcode: barcode
                    }
                })

                if (product) {
                    return product
                }
                else {
                    return null
                }
            }
            catch (err) {
                console.log(err)
                return null
            }
        }
    }
    catch (err) {
        console.log(err)
        return null
    }
}

const updateProduct = async (barcode, name, importprice, retailprice, quantity) => {
    Product.sync()

    try {
        const product = await Product.update({
            name: name,
            importprice: importprice,
            retailprice: retailprice,
            quantity: quantity,
        },
            {
                where: {
                    barcode: barcode
                }
            })

        if (product) {
            return product
        }
        else {
            return null
        }
    }
    catch {
        return null
    }
}

const updateUser = async (email, username, phone, country) => {
    User.sync()

    try {
        const user = User.update({
            fullname: username,
            phone: phone,
            country: country
        },
            {
                where: {
                    email: email
                },
                returnning: true
            })
        if (user) {
            return user
        }
        else {
            return null
        }
    }
    catch (err) {
        console.log(err)
        return null
    }
}

const getAllOrderByEmail = async (email) => {
    Order.sync()

    try {
        const order = await Order.findAll({
            where: {
                seller: email
            }
        })

        if (order) {
            return order
        }
        else {
            return null
        }
    }
    catch (err) {
        console.log(err)
        return null
    }
}

const createOrder = async (body) => {
    Order.sync()
    ProductOrder.sync()
    Product.sync()
    Customer.sync()

    const customername = body[0].customername
    const customerphone = body[0].customerphone
    const seller = body[0].seller
    const totalPrice = body[0].totalPrice

    try {
        const customer = await Customer.create({
            name: customername,
            phone: customerphone,
            address: 'VN'
        })
    }
    catch (err) {
        console.log(err)
    }

    let index = 0
    const order = await Order.create({
        seller: seller.trim(),
        customerphone: customerphone,
        price: totalPrice
    })
    try {
        body.forEach(async p => {
            if (index !== 0) {
                const product = await Product.findOne({
                    where: {
                        barcode: p.barcode
                    }
                })

                await Product.update({
                    quantity: product.quantity - p.quantity
                },
                    {
                        where: {
                            barcode: p.barcode
                        }
                    }
                )

                await order.addProducts(product, { through: { quantity: p.quantity } })
            }
            index++
        })
        return order
    }
    catch (err) {
        console.log(err)
        return null
    }
}

const getProductListByOrder = async (orderid) => {
    Order.sync()
    Product.sync()
    ProductOrder.sync()

    try {
        const order = await Order.findOne({
            where: {
                id: orderid
            },
            include: Product
        })

        if (order) {
            const product = order.Products

            return {
                order: order,
                product: product
            }
        }
        else {
            return null
        }

    }
    catch (err) {
        console.log(err)
        return null
    }
}

const getOrderByCustomerPhone = async (customerphone) => {
    Order.sync()

    try {
        const order = await Order.findAll({
            where: {
                customerphone: customerphone
            }
        })

        if (order) {
            return order
        }
        else {
            return null
        }
    }
    catch (err) {
        console.log(err)
        return null
    }
}

const createCustomer = async (name, phone) => {
    User.sync()

    const hashed = await bcrypt.hash(phone, 10)

    const email = `${phone}@gmail.com`

    try {
        const customer = await User.create({
            fullname: phone,
            email: email,
            password: hashed,
            phone: phone,
            country: 'VN',
            permission: 'customer',
            active: 'true',
            lock: 'false',
        })

        if (customer) {
            return customer
        }
        else {
            return null
        }
    }
    catch (err) {
        console.log(err)
        return null
    }
}

const getQuantityOfProductByOrderIdAndBarCode = async (orderid,barcode) => {
    ProductOrder.sync()

    try{
        const productorder = await ProductOrder.findOne({
            where:{
                ProductBarcode: barcode,
                OrderId: orderid
            }
        })


        if (productorder){
            return productorder.quantity
        }
        else{
            returnn0
        }
    }
    catch(err){
        console.log(err)
        return 0
    }
}

const getAllOrder = async () => {
    Order.sync()

    try{
        const order = await Order.findAll()
        if (order){
            return order
        }
        else{
            return null
        }
    }
    catch(err){
        console.log(err)
        return null
    }

}


(async () => {
    try {
        const adminpassword = await bcrypt.hash('admin', 10)
        const adminUser = await User.create({
            fullname: 'admin',
            email: 'admin@gmail.com',
            password: adminpassword,
            phone: null,
            country: null,
            permission: 'admin',
            active: "true",
            lock: "false"
        });
    } catch (error) {
    }
})();

(async () => {
    try {
        const product = await Product.create({
            barcode: 'P1',
            name: 'Tra Tac',
            importprice: '5000',
            retailprice: '15000',
            category: 'Water',
            quantity: 100
        });
    } catch (error) {
    }
})();
(async () => {
    try {
        const product = await Product.create({
            barcode: 'P2',
            name: 'Aquafina Water',
            importprice: '4000',
            retailprice: '6000',
            category: 'Water',
            quantity: 100
        });
    } catch (error) {
    }
})();
(async () => {
    try {
        const product = await Product.create({
            barcode: 'P3',
            name: 'Banh Bao',
            importprice: '10000',
            retailprice: '20000',
            category: 'Food',
            quantity: 100
        });
    } catch (error) {
    }
})();
(async () => {
    try {
        const product = await Product.create({
            barcode: 'P4',
            name: 'Xuc Xich',
            importprice: '5000',
            retailprice: '7000',
            category: 'Food',
            quantity: 100
        });
    } catch (error) {
    }
})();
(async () => {
    try {
        const product = await Product.create({
            barcode: 'P5',
            name: 'Tra Xanh',
            importprice: '5000',
            retailprice: '15000',
            category: 'Water',
            quantity: 100
        });
    } catch (error) {
    }
})();
(async () => {
    try {
        const product = await Product.create({
            barcode: 'P6',
            name: 'Coca Cola',
            importprice: '3000',
            retailprice: '9000',
            category: 'Water',
            quantity: 100
        });
    } catch (error) {
    }
})();
(async () => {
    try {
        const product = await Product.create({
            barcode: 'P7',
            name: 'Pepsi',
            importprice: '3200',
            retailprice: '8500',
            category: 'Water',
            quantity: 100
        });
    } catch (error) {
    }
})();
(async () => {
    try {
        const product = await Product.create({
            barcode: 'P8',
            name: 'Lays Potato Chips',
            importprice: '7000',
            retailprice: '12000',
            category: 'Snacks',
            quantity: 100
        });
    } catch (error) {
    }
})();
(async () => {
    try {
        const product = await Product.create({
            barcode: 'P9',
            name: 'KitKat',
            importprice: '5000',
            retailprice: '9000',
            category: 'Snacks',
            quantity: 100
        });
    } catch (error) {
    }
})();



module.exports = {getAllOrder, getQuantityOfProductByOrderIdAndBarCode, getOrderByCustomerPhone, createCustomer, getProductListByOrder, createOrder, getAllOrderByEmail, updateUser, updateProduct, deleteProduct, addProduct, lockUser, unblockUser, createUser, authUserLogin, createAuthStatus, getTokenVerifyAuthStatus, changeUserActiveStatus, getUser, changeUserPassword, getAllUser, getAllProduct, getProduct }

