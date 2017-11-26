$(document).ready(function() {
    $(".sendBtn").click(function() {
      $(".sendBtn").addClass("loading");
      setTimeout(function() {
        $(".sendBtn").addClass("hide-loading");
        // For failed icon just replace ".done" with ".failed"
        $(".done").addClass("finish");
      }, 3000);
      setTimeout(function() {
        $(".sendBtn").removeClass("loading");
        $(".sendBtn").removeClass("hide-loading");
        $(".done").removeClass("finish");
        $(".failed").removeClass("finish");
      }, 5000);
    })

    $('.modal').modal();
  });