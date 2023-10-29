import connection from '../models/connectDatabase.js'
import bcrypt from 'bcrypt';

class CategoryController {


    addCategory(req, res) {

        const { parent_id, name } = req.body

        const query = 'INSERT INTO `categories`(`name`, `parent_id`) VALUES (?,?)'
        connection.query(query, [name, Number(parent_id) > -1 ? Number(parent_id) : null], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            res.status(200).json({
                message: 'Thêm danh mục thành công',
                isSuccess: true
            })
        });
    }

    editCategory(req, res) {
        const { categoryEdit_id, parent_id, name } = req.body
        console.log(categoryEdit_id, parent_id, name);
        const query = 'UPDATE `categories` SET `name`= ?,`parent_id`= ? WHERE id = ?'
        connection.query(query, [name, Number(parent_id) > -1 ? Number(parent_id) : null, categoryEdit_id], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            res.status(200).json({
                message: 'Cập nhật danh mục thành công',
                isSuccess: true

            })
        });
    }

    removeCategory(req, res) {
        const { id } = req.body;
        console.log(id);
        const query = 'DELETE FROM `categories` WHERE id = ?'
        connection.query(query, [Number(id)], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            res.status(200).json({
                message: 'Cập nhật danh mục thành công',
                isSuccess: true

            })
        });
    }

    getCategory(req, res) {

        function categoryParent(list_parent, list_sub, index) {
            if (list_sub.length === 0) {
                return;
            }
            for (var i = 0; i < list_sub.length; i++) {
                if (list_sub[i].parent_id == list_parent[index].id) {
                    if (!list_parent[index].child_category) {
                        list_parent[index].child_category = [];
                        list_parent[index].child_category.push(list_sub[i]);
                        list_sub.splice(i, 1);
                    } else {

                        list_parent[index].child_category.push(list_sub[i]);
                        list_sub.splice(i, 1);
                    }
                    i--;

                }
            }

            if (list_parent[index].child_category && list_parent[index].child_category.length > 0) {

                var parent = list_parent[index].child_category;

                for (var j = 0; j < parent.length; j++) {
                    // console.log(parent.length, '-===================================', j);
                    categoryParent(parent, list_sub, j)
                }
            }

        }


        const query = 'SELECT `id`, `name`, `parent_id` FROM `categories`'

        connection.query(query, (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            var list_category = results;
            var object_category = [];

            for (var i = 0; i < list_category.length; i++) {
                if (list_category[i].parent_id == null) {
                    object_category.push(list_category[i]);
                    list_category.splice(i, 1);
                    i--;
                }

            }

            for (var i = 0; i < object_category.length; i++) {
                categoryParent(object_category, list_category, i)

            }

            res.status(200).json({
                message: 'get category',
                category: object_category
            })

        });



    }



}

const categoryController = new CategoryController;

export default categoryController;

// export { NewsController };