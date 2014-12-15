/**
 * Created by Sarah on 12/2/2014.
 */
$('#freq').hide();
document.getElementById("dateInput").required = true;
$('#repeated').click(function () {
    if (document.getElementById('repeated').checked) {
        $('#date').hide();
        $('#freq').show()
        $('#add-task').css("height","350px");
        $('.repeated').val(1);
        document.getElementById("dateStart").required = true;
        document.getElementById("dateEnd").required = true;
        document.getElementById("dateInput").required = false;
    }
    else {
        $('#date').show();
        $('#freq').hide();
        $('#add-task').css("height","175px");
        $('.repeated').val(0);
        document.getElementById("dateInput").required = true;
    }
});