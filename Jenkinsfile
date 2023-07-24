//Jenkins Params:
println("NAMESPACE: ${NAMESPACE}")            //dev|development|staging|uat|production
println("REPO_NAME: ${REPO_NAME}")           
println("SCM_BRANCH: ${SCM_BRANCH}")           //dev_v1.49.0|staging_v1.49.0|uat_v1.49.0|master|Stage_v1.6.0
println("================================================================================")

if(NAMESPACE=="production") {
  env.SLACK_CHANNEL='production'                        //production
  env.APIENVCONFIG='prod'                               //prod
  env.VAULT_ENV='production'                            //production
  env.DOCKER_ENV='production'                           //production
  env.DEPLOYMENT_ENV='production'                       //production
  env.KUBECONFIG='k8sProd'                             //eksProd
} else if(NAMESPACE=='staging'){
  env.SLACK_CHANNEL='staging'                           //staging
  env.APIENVCONFIG='stage'                              //stage
  env.VAULT_ENV='staging'                               //staging
  env.DOCKER_ENV='staging'                              //staging
  env.DEPLOYMENT_ENV='staging'                          //staging
  env.KUBECONFIG='k8sStaging'                             //eksNonProd
} else if(NAMESPACE=='uat'){
  env.SLACK_CHANNEL='uat'                               //uat
  env.APIENVCONFIG='uat'                                //uat
  env.VAULT_ENV='uat'                                   //uat
  env.DOCKER_ENV='uat'                                  //uat
  env.DEPLOYMENT_ENV='uat'                              //uat
  env.KUBECONFIG='k8sUat'                             //eksNonProd
} 

println("SLACK_CHANNEL: ${env.SLACK_CHANNEL}")                          //production|staging|uat|dev|development|learning
println("APIENVCONFIG: ${env.APIENVCONFIG}")                            //prod|stage|uat|dev
println("VAULT_ENV: ${env.VAULT_ENV}")                                  //production|staging|uat|dev
println("DOCKER_ENV: ${env.DOCKER_ENV}")                                //production|staging|uat|dev|development
println("DEPLOYMENT_ENV: ${env.DEPLOYMENT_ENV}")                        //production|staging|uat|development
println("KUBECONFIG: ${env.KUBECONFIG}")                                //eksProd|eksNonProd
println("================================================================================")

//deployName -used for rollout restart deploy $deployName
//slackSvcName -used for slackNotify
env.deployName=''
env.slackSvcName=''

if(REPO_NAME=='seedfi-backend') {
  env.deployName='seedfi-api' 
  env.slackSvcName='seedfi-backend' 
} else if(REPO_NAME=='seedfi-underwriting') {
  env.deployName='api' 
  env.slackSvcName='seedfi-underwriting'
} 

println("deployName: ${env.deployName}")
println("slackSvcName: ${env.slackSvcName}")
println("================================================================================")


//Vault
def secrets = [
  [path: 'secret/jenkins/github', engineVersion: 2, secretValues: [
    [envVar: 'GIT_TOKEN', vaultKey: 'token']]],
  [path: 'secret/k8s/kubeconfig/$KUBECONFIG', engineVersion: 2, secretValues: [
    [envVar: 'KUBE_CONFIG', vaultKey: 'secret']]],
  [path: 'secret/k8s/secrets/$VAULT_ENV/api-config', engineVersion: 2, secretValues: [
    [envVar: 'API_CONFIG',vaultKey: 'secret']]],
  [path: 'secret/k8s/secrets/$VAULT_ENV/underwriting-config', engineVersion: 2, secretValues: [
    [envVar: 'UNDERWRITING_CONFIG',vaultKey: 'secret']]]
]
def configuration = [vaultUrl: "${VAULT_ADDR}",  vaultCredentialId: 'vault-jenkins-role', engineVersion: 2]

node(){
  deleteDir()
  withVault([configuration: configuration, vaultSecrets: secrets]) {
    def container = docker.image('seedfidevops/containerbuilder')
    container.pull() // make sure we have the latest available from Docker Hub
    container.inside(){
      try {
        stage('Vault get vars'){
          //Downloaded/Created in $WORKSPACE
          writeFile file: "KUBE_CONFIG_FILE", text: KUBE_CONFIG

          //TODO: pull/create other svc secrets.yaml 
          if(REPO_NAME == 'seedfi-backend'){
            writeFile file: "API_CONFIG_FILE", text: API_CONFIG

          } 
          else if(REPO_NAME == 'seedfi-underwriting') {
            writeFile file: "UNDERWRITING_CONFIG_FILE", text: UNDERWRITING_CONFIG
          }

          sh ('pwd; ls -al')
        }

        stage("SCM: git") {
          sh 'git clone -b $SCM_BRANCH https://$GIT_TOKEN@github.com/enyata/$REPO_NAME.git'
        }

        stage("Set deployment Image Tag"){
          env.VERSION_NUMBER= sh(script: "jq '.version' ${REPO_NAME}/package.json", returnStdout: true).trim().replaceAll('"','')
          println("VERSION_NUMBER: ${env.VERSION_NUMBER}")

          //dockerTag
          env.dockerTag=''
          if(REPO_NAME=='seedfi-backend'){
            env.dockerTag="seedfidevops/seedfi-api:${DOCKER_ENV}_v${VERSION_NUMBER}"
          } else if(REPO_NAME=='seedfi-underwriting'){
            env.dockerTag="seedfidevops/seedfi-underwriting:${DOCKER_ENV}_v${VERSION_NUMBER}"
          }


         
          env.DEPLOYMENT_YAML='deployment.yml'
         
          println("DEPLOYMENT_YAML: ${DEPLOYMENT_YAML}")
          sh '''
            ls -al ${REPO_NAME}/kubernetes/${DEPLOYMENT_ENV}/${DEPLOYMENT_YAML}
            sed -i "s~ image:.*~ image: ${dockerTag}~" ${REPO_NAME}/kubernetes/${DEPLOYMENT_ENV}/${DEPLOYMENT_YAML}
            grep ' image:' ${REPO_NAME}/kubernetes/${DEPLOYMENT_ENV}/${DEPLOYMENT_YAML}
          '''
          
        }

        stage('k8s Deploy secrets') {
          if (REPO_NAME == 'seedfi-backend') {
            sh 'kubectl --kubeconfig KUBE_CONFIG_FILE -n $NAMESPACE apply -f API_CONFIG_FILE'
          }
         else if(REPO_NAME == 'seedfi-underwriting'){
            sh 'kubectl --kubeconfig KUBE_CONFIG_FILE -n $NAMESPACE apply -f UNDERWRITING_CONFIG_FILE'
         }

        }

        stage('k8s Deploy: Deployment') {
          DEPLOYDIR="${REPO_NAME}/kubernetes/${DEPLOYMENT_ENV}"
          dir(DEPLOYDIR){ 
            stdOut= sh(script: 'kubectl --kubeconfig $WORKSPACE/KUBE_CONFIG_FILE -n $NAMESPACE apply -f $DEPLOYMENT_YAML', returnStdout: true).trim().replaceAll('"','')
            println "===== stdOut: ${stdOut} ====="
            if(stdOut=~/configured/){
              sleep 2
              stdOut= sh(script: 'kubectl --kubeconfig $WORKSPACE/KUBE_CONFIG_FILE -n $NAMESPACE rollout restart deploy $deployName', returnStdout: true).trim().replaceAll('"','')
              println "===== stdOut: ${stdOut} ====="
            }
          }
        }

        stage('k8s Deploy: Service'){
          SVCDIR="${REPO_NAME}/kubernetes/services"
          dir(SVCDIR){
            env.svcNameYaml='api.yml'
            if(REPO_NAME=='seedfi-backend'){env.svcNameYaml='api.yml'}
    

            if(svcNameYaml){
              stdOut= sh(script: 'kubectl --kubeconfig $WORKSPACE/KUBE_CONFIG_FILE -n $NAMESPACE apply -f $svcNameYaml', returnStdout: true).trim().replaceAll('"','')
              println "===== stdOut: ${stdOut} ====="
            }

          }
        }

        stage('k8s display resources'){
          sh '''
            sleep 15
            kubectl --kubeconfig $WORKSPACE/KUBE_CONFIG_FILE -n $NAMESPACE get deploy,svc,po
          '''
        }

        stage('Slack Notification'){
          slackSend(channel: "${env.SLACK_CHANNEL}-deployment", color: 'good', teamDomain: 'enyata', tokenCredentialId: 'jenkinsSlack', 
            message: "PASSED: Finished Deploying '${env.slackSvcName}:${DOCKER_ENV}_v${VERSION_NUMBER}' to k8sCluster - ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)"
          )
        }

      } catch (err) {
        currentBuild.result = "FAILURE"
        slackSend(channel: "${env.SLACK_CHANNEL}-deployment", color: 'bad', teamDomain: 'enyata', tokenCredentialId: 'jenkinsSlack', 
          message: "FAILED: Unable to Deploy '${env.slackSvcName}:${DOCKER_ENV}_v${VERSION_NUMBER}' to k8sCluster - ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)"
        )
      }
    }
  }
}