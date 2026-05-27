#!/bin/bash

# Livid MySQL Docker 启动脚本
# 用于在 macOS 上启动 MySQL Docker 容器

# 配置信息
MYSQL_CONTAINER_NAME="livid-mysql"
MYSQL_ROOT_PASSWORD="root123"
MYSQL_DATABASE="livid-vue"
MYSQL_PORT=3306
MYSQL_VERSION="8.0"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否运行
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_warn "Docker 未运行，正在尝试启动 Docker Desktop..."
        open -a Docker
        
        print_info "等待 Docker 启动..."
        local max_wait=60
        local count=0
        while ! docker info > /dev/null 2>&1; do
            if [ $count -ge $max_wait ]; then
                print_error "Docker 启动超时，请手动启动 Docker Desktop"
                return 1
            fi
            sleep 2
            count=$((count + 2))
            echo -n "."
        done
        echo ""
        print_info "Docker 已启动"
    else
        print_info "Docker 已运行"
    fi
    return 0
}

# 检查MySQL镜像是否存在
check_mysql_image() {
    docker images mysql:$MYSQL_VERSION --format '{{.Repository}}:{{.Tag}}' | grep -q "mysql:$MYSQL_VERSION"
}

# 拉取MySQL镜像
pull_mysql_image() {
    if check_mysql_image; then
        print_info "MySQL 镜像已存在"
        return 0
    fi
    
    print_info "正在拉取 MySQL 镜像..."
    print_warn "如果拉取缓慢，请配置 Docker 镜像加速器"
    echo ""
    echo "配置方法：Docker Desktop -> Settings -> Docker Engine"
    echo "添加以下配置："
    echo '{'
    echo '  "registry-mirrors": ['
    echo '    "https://docker.1ms.run",'
    echo '    "https://docker.xuanyuan.me"'
    echo '  ]'
    echo '}'
    echo ""
    
    docker pull mysql:$MYSQL_VERSION
    
    if [ $? -eq 0 ]; then
        print_info "MySQL 镜像拉取成功"
        return 0
    else
        print_error "MySQL 镜像拉取失败"
        print_error "请检查网络连接或配置镜像加速器后重试"
        return 1
    fi
}

# 检查容器是否存在
check_container_exists() {
    docker ps -a --format '{{.Names}}' | grep -q "^${MYSQL_CONTAINER_NAME}$"
}

# 检查容器是否正在运行
check_container_running() {
    docker ps --format '{{.Names}}' | grep -q "^${MYSQL_CONTAINER_NAME}$"
}

# 启动MySQL容器
start_mysql() {
    if check_container_running; then
        print_info "MySQL 容器已在运行"
        return 0
    fi
    
    if check_container_exists; then
        print_info "启动已存在的 MySQL 容器..."
        docker start $MYSQL_CONTAINER_NAME
    else
        print_info "创建并启动 MySQL 容器..."
        docker run -d \
            --name $MYSQL_CONTAINER_NAME \
            -p $MYSQL_PORT:3306 \
            -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
            -e MYSQL_DATABASE=$MYSQL_DATABASE \
            -v livid-mysql-data:/var/lib/mysql \
            --restart=always \
            mysql:$MYSQL_VERSION \
            --default-authentication-plugin=mysql_native_password \
            --character-set-server=utf8mb4 \
            --collation-server=utf8mb4_unicode_ci
    fi
    
    if [ $? -eq 0 ]; then
        print_info "MySQL 容器启动成功"
        return 0
    else
        print_error "MySQL 容器启动失败"
        return 1
    fi
}

# 等待MySQL就绪
wait_for_mysql() {
    print_info "等待 MySQL 就绪..."
    local max_wait=120
    local count=0
    
    while ! docker exec $MYSQL_CONTAINER_NAME mysqladmin ping -h"localhost" -u"root" -p"$MYSQL_ROOT_PASSWORD" --silent 2>/dev/null; do
        if [ $count -ge $max_wait ]; then
            print_error "MySQL 启动超时"
            return 1
        fi
        sleep 2
        count=$((count + 2))
        echo -n "."
    done
    echo ""
    print_info "MySQL 已就绪"
    return 0
}

# 显示连接信息
show_connection_info() {
    echo ""
    echo "========================================"
    echo "       MySQL 连接信息"
    echo "========================================"
    echo "主机:     localhost"
    echo "端口:     $MYSQL_PORT"
    echo "用户名:   root"
    echo "密码:     $MYSQL_ROOT_PASSWORD"
    echo "数据库:   $MYSQL_DATABASE"
    echo "========================================"
    echo ""
}

# 主函数
main() {
    echo ""
    echo "========================================"
    echo "  Livid MySQL Docker 启动脚本"
    echo "========================================"
    echo ""
    
    # 检查Docker
    if ! check_docker; then
        exit 1
    fi
    
    # 拉取镜像
    if ! pull_mysql_image; then
        exit 1
    fi
    
    # 启动MySQL
    if start_mysql; then
        # 等待MySQL就绪
        if wait_for_mysql; then
            show_connection_info
            print_info "MySQL 数据库已准备就绪！"
            exit 0
        else
            exit 1
        fi
    else
        exit 1
    fi
}

# 执行主函数
main
