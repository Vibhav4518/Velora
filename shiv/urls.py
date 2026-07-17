from django.urls import path
from . import views


urlpatterns = [

    # ======================================================
    # WEBSITE PAGES
    # ======================================================

    path("", views.home, name="home_page"),
    path("categories/", views.categories, name="categories_page"),
    path("contact/", views.contact, name="contact_page"),
    path("deals/", views.deals, name="deals_page"),
    path("shop/", views.shop, name="shop_page"),
    path("blog/", views.blog, name="blog_page"),

    path("product/<uuid:product_id>/", views.product_details, name="product_details"),


    # ======================================================
    # AUTHENTICATION
    # ======================================================

    path("account/register/", views.user_registration, name="register_user"),
    path("account/login/", views.user_login, name="login_user"),
    path("account/logout/", views.user_logout, name="logout_user"),

    # ======================================================
    # PROFILE
    # ======================================================
    
    path("my-profile/", views.my_profile, name="my_profile"),
    path("profile/update/", views.update_profile_ajax, name="update_profile_ajax"),    
    path("address/add/", views.add_address_ajax, name="add_address_ajax"),
    path("address/edit/<uuid:address_id>/", views.edit_address_ajax, name="edit_address_ajax"),
    path("address/default/<uuid:address_id>/", views.set_default_address_ajax, name="set_default_address"),
    path("address/delete/<uuid:address_id>/", views.delete_address_ajax, name="delete_address"),
    
    
    # ======================================================
    # CART
    # ======================================================

    path("cart/", views.cart_page, name="cart"),
    path("add_to_cart/<uuid:product_id>/", views.add_to_cart, name="add_to_cart"),
    path("remove_cart/<uuid:product_id>/", views.remove_cart, name="remove_cart"),
    
    
    path("checkout/", views.checkout, name="checkout"),
    path("checkout/address/<uuid:address_id>/", views.checkout_set_address, name="checkout_set_address"),
    
    # ======================================================
    # Wishlist
    # ======================================================
    
    path("wishlist/", views.wishlist_page, name="wishlist_page"),
    path("wishlist/add/<uuid:product_id>/", views.add_to_wishlist, name="add_to_wishlist"),
    path("wishlist/remove/<uuid:item_id>/", views.remove_from_wishlist, name="remove_from_wishlist"),
    path("wishlist/move-to-cart/<uuid:item_id>/", views.move_to_cart, name="move_to_cart"),
    path("wishlist/clear/", views.clear_wishlist, name="clear_wishlist"),
    
    
    # ======================================================
    # orders
    # ======================================================
        
 
    path("my-orders/", views.my_orders, name="my_orders"),
    path("my-orders/<uuid:id>/", views.my_order_details, name="my_order_details"),
    path("place-order/", views.place_order, name="place_order"),
    path("order/<uuid:id>/cancel/", views.cancel_order, name="cancel_order"),
    path("order/<uuid:id>/invoice/", views.download_invoice, name="download_invoice"),

    # ======================================================
    # ADMIN DASHBOARD
    # ======================================================

    path("admin/dashboard/", views.admin_dashboard, name="admin_dashboard"),


    # ======================================================
    # ADMIN PROFILE
    # ======================================================

    path("admin/profile/", views.admin_profile, name="admin_profile"),
    


    # ======================================================
    # ADMIN USERS
    # ======================================================

    path("admin/users/", views.admin_users, name="admin_users"),
    path("admin/users/add/", views.add_admin_user, name="add_admin_user"),
    path("admin/users/edit/<uuid:id>/", views.edit_admin_user, name="edit_admin_user"),
    path("admin/users/change-role/<uuid:id>/", views.change_admin_role, name="change_admin_role"),
    path("admin/users/reset-password/<uuid:id>/", views.reset_admin_password, name="reset_admin_password"),
    path("admin/users/delete/<uuid:id>/", views.delete_admin_user, name="delete_admin_user"),
    
    path("admin/customers/edit/<uuid:id>/", views.edit_customer, name="edit_customer"),
    path("admin/customers/delete/<uuid:id>/", views.delete_customer, name="delete_customer"),


    # ======================================================
    # ROLE MANAGEMENT
    # ======================================================

    path("admin/roles/", views.admin_role_list, name="admin_role_list"),
    path("admin/roles/add/", views.admin_add_role, name="admin_add_role"),
    path("admin/roles/delete/<uuid:role_id>/", views.admin_delete_role, name="admin_delete_role"),
    path("admin/roles/<uuid:role_id>/permissions/", views.admin_role_permission, name="admin_role_permission"),
    path("admin/roles/edit/<uuid:role_id>/", views.admin_edit_role, name="admin_edit_role"),


    # ======================================================
    # ADMIN CATALOG
    # ======================================================
    
    path("admin/products/", views.admin_products, name="admin_products"),
    path("admin/product/add/", views.add_product, name="add_product"),
    path("admin/category/add/", views.add_category, name="add_category"),
    path("admin/category/list/", views.category_list, name="category_list"),
    path("admin/products/edit/<uuid:id>/", views.edit_product_admin, name="edit_product_admin"),
    path("admin/products/delete/<uuid:id>/", views.delete_product_admin, name="delete_product_admin"),
    path("admin/category/edit/<uuid:id>/", views.edit_category_admin, name="edit_category_admin"),
    path("admin/category/delete/<uuid:id>/", views.delete_category_admin, name="delete_category_admin"),
    
    
    # ======================================================
    # ADMIN DEALS
    # ======================================================
    
    path("admin/deals/", views.admin_deals, name="admin_deals"),
    path("admin/deals/save/", views.admin_save_deal, name="admin_save_deal"),
    path("admin/deals/<uuid:deal_id>/details/", views.admin_deal_details, name="admin_deal_details"),
    path("admin/deals/<uuid:deal_id>/toggle/", views.admin_toggle_deal, name="admin_toggle_deal"),
    path("admin/deals/<uuid:deal_id>/delete/", views.admin_delete_deal, name="admin_delete_deal"),


    # ======================================================
    # ADMIN SALES
    # ======================================================

    #--------------------order section----------------------

    path("admin/orders/", views.admin_orders, name="admin_orders"),
    path("admin/order/<uuid:id>/status/", views.update_order_status, name="update_order_status"),
    path("admin/order/<uuid:id>/delete/", views.delete_order_admin, name="delete_order_admin"),
    
    
    path("admin/payments/", views.admin_payments, name="admin_payments"),
    path("admin/customers/", views.admin_customers, name="admin_customers"),
    
# ======================================================
# ADMIN BLOG MANAGEMENT
# ======================================================

path(
    "admin/blogs/",
    views.admin_blog_posts,
    name="admin_blog_posts"
),

path(
    "admin/blogs/save/",
    views.admin_save_blog_post,
    name="admin_save_blog_post"
),

path(
    "admin/blogs/<uuid:post_id>/details/",
    views.admin_blog_post_details,
    name="admin_blog_post_details"
),

path(
    "admin/blogs/<uuid:post_id>/status/",
    views.admin_toggle_blog_status,
    name="admin_toggle_blog_status"
),

path(
    "admin/blogs/<uuid:post_id>/feature/",
    views.admin_toggle_blog_feature,
    name="admin_toggle_blog_feature"
),

path(
    "admin/blogs/<uuid:post_id>/delete/",
    views.admin_delete_blog_post,
    name="admin_delete_blog_post"
),

path(
    "admin/blog-categories/save/",
    views.admin_save_blog_category,
    name="admin_save_blog_category"
),

path(
    "admin/blog-categories/<uuid:category_id>/delete/",
    views.admin_delete_blog_category,
    name="admin_delete_blog_category"
),
# ======================================================
# ADMIN CONTACT MESSAGES
# ======================================================

path(
    "admin/contact-messages/",
    views.admin_contact_messages,
    name="admin_contact_messages"
),

path(
    "admin/contact-messages/<uuid:message_id>/details/",
    views.admin_contact_message_details,
    name="admin_contact_message_details"
),

path(
    "admin/contact-messages/<uuid:message_id>/status/",
    views.admin_update_contact_status,
    name="admin_update_contact_status"
),

path(
    "admin/contact-messages/<uuid:message_id>/delete/",
    views.admin_delete_contact_message,
    name="admin_delete_contact_message"
),

# ======================================================
# PRODUCT REVIEWS
# ======================================================

path(
    "product/<uuid:product_id>/review/save/",
    views.save_product_review,
    name="save_product_review"
),

path(
    "product/review/<uuid:review_id>/delete/",
    views.delete_product_review,
    name="delete_product_review"
),
path(
    "ajax/header-product-search/",
    views.header_product_search,
    name="header_product_search"
),
path(
    "admin/blog/category/<uuid:category_id>/details/",
    views.admin_blog_category_details,
    name="admin_blog_category_details",
),

path(
    "admin/blog/category/<uuid:category_id>/toggle/",
    views.admin_toggle_blog_category_status,
    name="admin_toggle_blog_category_status",
),

path(
    "admin/blog/category/<uuid:category_id>/delete/",
    views.admin_delete_blog_category,
    name="admin_delete_blog_category",
),



path(
    "blog/popup/<slug:slug>/",
    views.public_blog_popup_details,
    name="public_blog_popup_details",
),

path(
    "blog/<slug:slug>/",
    views.blog_details,
    name="blog_details",
),
path(
    "admin/products/import/",
    views.import_products,
    name="import_products"
),

]


