# service-jenkins/Dockerfile

FROM jenkins/jenkins:lts

USER root

# 1. Installe docker.io (le CLI)
# 2. Récupère le GID exact du socket monté
# 3. Crée (ou retrouve) un groupe 'docker' au même GID
# 4. Ajoute l'utilisateur jenkins à ce groupe
# 5. Ajuste les droits sur le socket (si jamais il est remonté en root:root)
RUN apt-get update \
 && apt-get install -y docker.io \
 && SOCKET_GID=$(stat -c '%g' /var/run/docker.sock) \
 && groupadd -g ${SOCKET_GID} docker 2>/dev/null || true \
 && usermod -aG docker jenkins \
 && chown root:docker /var/run/docker.sock \
 && chmod 660 /var/run/docker.sock \
 && rm -rf /var/lib/apt/lists/*

# On revient en utilisateur jenkins
USER jenkins
