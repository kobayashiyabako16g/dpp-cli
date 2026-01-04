FROM debian:stable-slim

# パッケージインストールを最小限に抑える設定
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Nix package manager (single-user mode for Docker)
RUN mkdir -m 0755 /nix && chown root /nix && \
    mkdir -p /etc/nix && \
    echo "build-users-group =" > /etc/nix/nix.conf && \
    curl -L https://nixos.org/nix/install | sh -s -- --no-daemon

# Enable nix and set up environment
ENV PATH="/root/.nix-profile/bin:${PATH}"
RUN mkdir -p /root/.config/nix && \
    echo "build-users-group =" >> /root/.config/nix/nix.conf && \
    echo "experimental-features = nix-command flakes" >> /root/.config/nix/nix.conf && \
    echo ". /root/.nix-profile/etc/profile.d/nix.sh" >> /root/.bashrc

# 作業ディレクトリ
WORKDIR /app

# flake.nixをコピー（開発環境の定義）
COPY flake.nix flake.lock* ./

# flakeの依存関係をプリビルド（オプション: キャッシュ効率化）
RUN . /root/.nix-profile/etc/profile.d/nix.sh && \
    nix develop --command true || true

# デフォルトでdevshellに入る
CMD ["bash", "-c", "nix develop"]
