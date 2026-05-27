#!/bin/bash

# Node Livid Docker Compose 启动脚本

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

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

check_docker_compose() {
    if docker compose version > /dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    elif docker-compose version > /dev/null 2>&1; then
        COMPOSE_CMD="docker-compose"
    else
        print_error "未找到 docker compose 命令"
        return 1
    fi
    return 0
}

start_services() {
    print_info "启动服务..."
    cd "$PROJECT_DIR"
    $COMPOSE_CMD up -d
    
    if [ $? -eq 0 ]; then
        print_info "服务启动成功"
        return 0
    else
        print_error "服务启动失败"
        return 1
    fi
}

stop_services() {
    print_info "停止服务..."
    cd "$PROJECT_DIR"
    $COMPOSE_CMD down
    print_info "服务已停止"
}

wait_for_services() {
    print_info "等待服务就绪..."
    
    local max_wait=120
    local count=0
    
    while true; do
        local mysql_status=$($COMPOSE_CMD ps mysql --format json 2>/dev/null | grep -o '"Status":"[^"]*"' | head -1)
        local redis_status=$($COMPOSE_CMD ps redis --format json 2>/dev/null | grep -o '"Status":"[^"]*"' | head -1)
        
        if [[ "$mysql_status" == *"healthy"* ]] && [[ "$redis_status" == *"healthy"* ]]; then
            print_info "所有服务已就绪"
            return 0
        fi
        
        if [ $count -ge $max_wait ]; then
            print_warn "等待超时，服务可能仍在启动中"
            return 0
        fi
        
        sleep 2
        count=$((count + 2))
        echo -n "."
    done
}

show_status() {
    echo ""
    echo "========================================"
    echo "       服务状态"
    echo "========================================"
    cd "$PROJECT_DIR"
    $COMPOSE_CMD ps
    echo ""
}

show_connection_info() {
    echo ""
    echo "========================================"
    echo "       连接信息"
    echo "========================================"
    echo ""
    echo "MySQL:"
    echo "  主机:     localhost"
    echo "  端口:     3306"
    echo "  用户名:   root"
    echo "  密码:     root123"
    echo "  数据库:   livid-vue"
    echo ""
    echo "Redis:"
    echo "  主机:     localhost"
    echo "  端口:     6379"
    echo "  密码:     (无)"
    echo ""
    echo "========================================"
    echo ""
}

show_usage() {
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  start   启动所有服务 (默认)"
    echo "  stop    停止所有服务"
    echo "  restart 重启所有服务"
    echo "  status  查看服务状态"
    echo "  logs    查看服务日志"
    echo "  help    显示帮助信息"
}

main() {
    echo ""
    echo "========================================"
    echo "  Node Livid Docker Compose 管理脚本"
    echo "========================================"
    echo ""
    
    local command="${1:-start}"
    
    if ! check_docker; then
        exit 1
    fi
    
    if ! check_docker_compose; then
        exit 1
    fi
    
    case "$command" in
        start)
            start_services
            wait_for_services
            show_status
            show_connection_info
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            start_services
            wait_for_services
            show_status
            show_connection_info
            ;;
        status)
            show_status
            show_connection_info
            ;;
        logs)
            cd "$PROJECT_DIR"
            $COMPOSE_CMD logs -f
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "未知命令: $command"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
