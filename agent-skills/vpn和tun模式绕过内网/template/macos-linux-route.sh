#!/bin/bash
# Linux/macOS 静态路由添加脚本
# 用途：为内网网段添加静态路由，绕过 TUN 接口
# 使用：sudo ./macos-linux-route.sh

set -e

# ============ 配置区 ============
# 内网网段列表（根据实际情况修改）
INTERNAL_SUBNETS=(
  "10.17.196.0/24"
  "10.0.0.0/8"
  "172.16.0.0/12"
  "192.168.0.0/16"
)

# 网关地址（通常是路由器 IP，需根据实际网络环境修改）
GATEWAY="10.17.77.1"

# Metric 值（优先级，数字越小优先级越高）
METRIC=5

# ============ 检测操作系统 ============
OS_TYPE=$(uname)

# ============ 函数定义 ============
add_route_linux() {
  local subnet=$1
  local gateway=$2
  local metric=$3
  
  echo "添加路由: $subnet via $gateway metric $metric"
  if ip route add "$subnet" via "$gateway" metric "$metric" 2>/dev/null; then
    echo "✓ 成功"
  else
    echo "✗ 失败（可能已存在）"
    # 尝试替换
    ip route replace "$subnet" via "$gateway" metric "$metric"
  fi
}

add_route_macos() {
  local subnet=$1
  local gateway=$2
  
  echo "添加路由: $subnet via $gateway"
  if route -n add -net "$subnet" "$gateway" 2>/dev/null; then
    echo "✓ 成功"
  else
    echo "✗ 失败（可能已存在）"
  fi
}

delete_route_linux() {
  local subnet=$1
  echo "删除路由: $subnet"
  ip route del "$subnet" 2>/dev/null || echo "路由不存在"
}

delete_route_macos() {
  local subnet=$1
  echo "删除路由: $subnet"
  route -n delete -net "$subnet" 2>/dev/null || echo "路由不存在"
}

show_routes() {
  echo "当前内网路由表:"
  if [ "$OS_TYPE" = "Linux" ]; then
    ip route | grep -E "10\.|172\.|192\.168\."
  elif [ "$OS_TYPE" = "Darwin" ]; then
    netstat -rn | grep -E "10\.|172\.|192\.168\."
  fi
}

# ============ 主逻辑 ============
echo "检测到操作系统: $OS_TYPE"

# 检查 root 权限
if [ "$EUID" -ne 0 ]; then
  echo "错误: 需要 root 权限，请使用 sudo 运行"
  exit 1
fi

# 显示当前路由
show_routes

echo ""
echo "============ 开始添加路由 ============"

if [ "$OS_TYPE" = "Linux" ]; then
  for subnet in "${INTERNAL_SUBNETS[@]}"; do
    add_route_linux "$subnet" "$GATEWAY" "$METRIC"
  done
elif [ "$OS_TYPE" = "Darwin" ]; then
  for subnet in "${INTERNAL_SUBNETS[@]}"; do
    add_route_macos "$subnet" "$GATEWAY"
  done
else
  echo "不支持的操作系统: $OS_TYPE"
  exit 1
fi

echo ""
echo "============ 添加完成 ============"
show_routes

echo ""
echo "注意事项:"
echo "1. 静态路由在系统重启后会失效，需重新运行脚本"
echo "2. 如需永久生效，请添加到系统启动脚本或 NetworkManager 配置"
echo "3. 删除路由请使用: $0 delete"

# ============ 删除模式 ============
if [ "$1" = "delete" ]; then
  echo ""
  echo "============ 删除路由 ============"
  if [ "$OS_TYPE" = "Linux" ]; then
    for subnet in "${INTERNAL_SUBNETS[@]}"; do
      delete_route_linux "$subnet"
    done
  elif [ "$OS_TYPE" = "Darwin" ]; then
    for subnet in "${INTERNAL_SUBNETS[@]}"; do
      delete_route_macos "$subnet"
    done
  fi
  echo "删除完成"
fi
